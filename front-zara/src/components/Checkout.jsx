import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImg, API_URL } from '../constants';

const Checkout = ({ cart, cartTotal, clearCart }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        postalCode: "",
        city: "",
        phone: ""
    });

    const [errors, setErrors] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingMethod, setShippingMethod] = useState("inpost_kurier");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors.includes(name)) {
            setErrors(prev => prev.filter(error => error !== name));
        }
    };

    // Funkcja do pobierania zdjêcia
    const getProductImage = (pId) => `${API_URL}/static/uploads/${pId}.jpg`;

    const handlePayNow = async (e) => {
        e.preventDefault();

        const requiredFields = ['email', 'firstName', 'lastName', 'address', 'postalCode', 'city', 'phone'];
        const newErrors = requiredFields.filter(field => !formData[field].trim());

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsProcessing(true);

        try {
            const res = await axios.patch(`${API_URL}/checkout`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const finalTotal = cartTotal + (shippingMethod === 'inpost_pobranie' ? 20 : 0);
            clearCart();

            navigate('/success', {
                state: {
                    order_id: res.data.order_id,
                    total: finalTotal,
                    items: cart
                }
            });

        } catch (err) {
            console.error("B³¹d podczas finalizacji:", err);
            alert(err.response?.data?.detail || "Wyst¹pi³ b³¹d. Upewnij siê, ¿e jesteœ zalogowany.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getInputClass = (name) => {
        const hasError = errors.includes(name);
        return `w-full p-4 border rounded-md outline-none transition-all ${hasError ? 'border-red-500' : 'border-gray-300 focus:ring-1 focus:ring-black'}`;
    };

    if (cart.length === 0) {
        return <div className="pt-40 text-center uppercase tracking-widest font-bold">Your bag is empty</div>;
    }

    return (
        <div className="pt-20 bg-white min-h-screen">
            <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-screen border-t border-gray-100">

                {/* LEWA STRONA: FORMULARZE */}
                <div className="flex-1 p-8 lg:p-16 lg:border-r border-gray-200">
                    <form onSubmit={handlePayNow} className="max-w-[600px] ml-auto space-y-12">

                        <section>
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-xl font-bold uppercase">Contact</h2>
                            </div>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                className={getInputClass('email')}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold uppercase">Delivery</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="firstName" type="text" placeholder="First name" className={getInputClass('firstName')} value={formData.firstName} onChange={handleChange} />
                                <input name="lastName" type="text" placeholder="Last name" className={getInputClass('lastName')} value={formData.lastName} onChange={handleChange} />
                            </div>
                            <input name="address" type="text" placeholder="Address" className={getInputClass('address')} value={formData.address} onChange={handleChange} />
                            <input name="apartment" type="text" placeholder="Apartment (optional)" className="w-full p-4 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-black" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="postalCode" type="text" placeholder="Postal code" className={getInputClass('postalCode')} value={formData.postalCode} onChange={handleChange} />
                                <input name="city" type="text" placeholder="City" className={getInputClass('city')} value={formData.city} onChange={handleChange} />
                            </div>
                            <input name="phone" type="tel" placeholder="Phone" className={getInputClass('phone')} value={formData.phone} onChange={handleChange} />
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold uppercase">Shipping method</h2>
                            <div className="border border-black rounded-md overflow-hidden">
                                <label className={`flex justify-between p-4 cursor-pointer border-b border-black ${shippingMethod === 'inpost_kurier' ? 'bg-gray-50' : ''}`}>
                                    <div className="flex gap-4">
                                        <input type="radio" name="shipping" checked={shippingMethod === 'inpost_kurier'} onChange={() => setShippingMethod('inpost_kurier')} className="accent-black" />
                                        <div className="text-[13px] uppercase tracking-tight">
                                            <p className="font-bold">InPost kurier</p>
                                            <p className="opacity-50 text-[10px]">Delivery in 24h</p>
                                        </div>
                                    </div>
                                    <span className="text-[13px] font-bold">FREE</span>
                                </label>
                                <label className={`flex justify-between p-4 cursor-pointer ${shippingMethod === 'inpost_pobranie' ? 'bg-gray-50' : ''}`}>
                                    <div className="flex gap-4">
                                        <input type="radio" name="shipping" checked={shippingMethod === 'inpost_pobranie'} onChange={() => setShippingMethod('inpost_pobranie')} className="accent-black" />
                                        <div className="text-[13px] uppercase tracking-tight">
                                            <p className="font-bold">InPost kurier - Pobranie</p>
                                            <p className="opacity-50 text-[10px]">Pay on delivery</p>
                                        </div>
                                    </div>
                                    <span className="text-[13px] font-bold">20.00 PLN</span>
                                </label>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold uppercase">Payment</h2>
                            <div className="border border-black p-8 text-center bg-gray-50">
                                <p className="text-[12px] uppercase tracking-widest opacity-60">
                                    Secure transaction processed by KRYSZTAL SYSTEM.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full bg-black text-white py-6 text-[12px] uppercase tracking-[0.5em] font-bold hover:invert border border-black transition-all duration-500
                                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {isProcessing ? "Processing..." : "Pay now"}
                            </button>
                        </section>
                    </form>
                </div>

                {/* PRAWA STRONA: PODSUMOWANIE - ZDJÊCIA ZAWSZE W KOLORZE */}
                <div className="lg:w-[500px] bg-gray-50 p-8 lg:p-16">
                    <div className="max-w-[400px] mx-auto space-y-8 sticky top-20">
                        <div className="space-y-6">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-20 bg-white border border-black overflow-hidden">
                                            <img
                                                src={getProductImage(item.product_id)}
                                                className="w-full h-full object-cover transition-all" // USUNIÊTO grayscale
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = getImg(item.category);
                                                }}
                                            />
                                            <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-5 h-5 flex items-center justify-center font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="text-[12px] uppercase tracking-tight">
                                            <p className="font-bold">{item.name}</p>
                                            <p className="opacity-50">{item.size}</p>
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-bold">{(item.price * item.quantity).toFixed(2)} PLN</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-black text-[12px] uppercase tracking-widest">
                            <div className="flex justify-between">
                                <span className="opacity-60">Subtotal</span>
                                <span className="font-bold">{cartTotal.toFixed(2)} PLN</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">Shipping</span>
                                <span className="font-bold">{shippingMethod === 'inpost_pobranie' ? '20.00 PLN' : 'FREE'}</span>
                            </div>
                            <div className="flex justify-between pt-6 border-t border-black">
                                <span className="text-xl font-bold tracking-tighter uppercase">Total</span>
                                <span className="text-2xl font-bold tracking-tighter">
                                    {(cartTotal + (shippingMethod === 'inpost_pobranie' ? 20 : 0)).toFixed(2)} PLN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;