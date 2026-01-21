import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus } from 'lucide-react';
import { getImg, API_URL } from '../constants';

const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, cartTotal }) => {
    const navigate = useNavigate();

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    // Helper do budowania URL zdjęcia z serwera
    const getProductImage = (productId) => {
        return `${API_URL}/static/uploads/${productId}.jpg`;
    };

    return (
        <>
            {/* OVERLAY */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* DRAWER */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[150] border-l border-black transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">

                    {/* HEADER */}
                    <div className="flex justify-between items-center h-20 px-8 border-b border-black">
                        <span className="text-[13px] uppercase tracking-[0.3em] font-bold">Your Bag</span>
                        <button onClick={onClose} className="p-2 hover:rotate-90 transition-transform duration-300 bg-transparent border-none cursor-pointer">
                            <X size={24} strokeWidth={1} />
                        </button>
                    </div>

                    {/* FREE SHIPPING BANNER */}
                    <div className="py-3 px-8 border-b border-black bg-gray-50 flex justify-center text-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold">
                            {cartTotal >= 500
                                ? "You've unlocked free shipping!"
                                : `Spend ${(500 - cartTotal).toFixed(2)} PLN more for free shipping`}
                        </p>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <p className="text-[12px] uppercase tracking-[0.4em] text-center leading-loose font-bold">Bag is empty</p>
                            </div>
                        ) : cart.map((item) => (
                            <div key={`${item.product_id}-${item.size}`} className="flex gap-6 animate-in fade-in slide-in-from-right-4 duration-500 group">

                                {/* ZDJĘCIE - KOLOROWE */}
                                <div className="w-[100px] h-[130px] overflow-hidden bg-[#F9F9F9] border border-gray-100 flex-shrink-0">
                                    <img
                                        src={getProductImage(item.product_id)}
                                        className="w-full h-full object-cover transition-all duration-700"
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getImg(item.category);
                                        }}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[13px] font-bold uppercase tracking-wider">{item.name}</h3>
                                            <p className="text-[13px] font-bold">{item.price} PLN</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                            Size: <span className="text-black font-bold border-b border-black">{item.size}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between mt-4">
                                        {/* QUANTITY SELECTOR */}
                                        <div className="flex items-center border border-black h-10">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.size, -1)}
                                                className="px-3 hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer h-full flex items-center"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="px-3 text-[12px] font-bold border-x border-black h-full flex items-center min-w-[30px] justify-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.size, 1)}
                                                className="px-3 hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer h-full flex items-center"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        {/* REMOVE BUTTON */}
                                        <button
                                            onClick={() => removeFromCart(item.product_id, item.size)}
                                            className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:opacity-50 transition-all bg-transparent cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER */}
                    {cart.length > 0 && (
                        <div className="p-8 border-t border-black bg-white">
                            <div className="flex justify-between text-xl uppercase tracking-tighter font-bold mb-6">
                                <span>Subtotal:</span>
                                <span>{cartTotal.toFixed(2)} PLN</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-6 text-[12px] uppercase tracking-[0.5em] hover:invert border border-black transition-all duration-500 font-bold group cursor-pointer"
                            >
                                Proceed to Checkout
                                <span className="inline-block transition-transform group-hover:translate-x-2 ml-2">→</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;