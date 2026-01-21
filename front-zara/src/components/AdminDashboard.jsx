import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL, getImg, CATEGORIES } from '../constants';
import { X, Plus, Minus, CheckCircle, AlertCircle, Search, Upload, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = () => {
    // Dynamiczne filtrowanie kategorii z constants.js
    const filteredCategories = CATEGORIES.filter(cat => cat !== "ALL" && cat !== "NEW ARRIVALS");

    const [allProducts, setAllProducts] = useState([]);
    const [product, setProduct] = useState({
        name: '',
        price: '',
        category: filteredCategories[0] || 'HOODIES'
    });
    const [adminSearchTerm, setAdminSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // --- IMAGE STATE ---
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    // Modals & Notification state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockChange, setStockChange] = useState({ size: 'M', quantity: 0 });
    const [newPrice, setNewPrice] = useState('');
    const [notification, setNotification] = useState({ message: '', type: 'success', visible: false });

    const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, productName: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, visible: true });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3500);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products/search`, {
                params: {
                    q: adminSearchTerm,
                    limit: productsPerPage,
                    offset: (currentPage - 1) * productsPerPage,
                    sort: 'newest'
                }
            });
            setAllProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching products:", err);
            showNotification("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    }, [adminSearchTerm, currentPage]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(delay);
    }, [fetchProducts]);

    useEffect(() => {
        setCurrentPage(1);
    }, [adminSearchTerm]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (parseFloat(product.price) < 0) {
            showNotification("Price cannot be negative", "error");
            return;
        }

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('category', product.category);
        if (imageFile) formData.append('file', imageFile);

        try {
            await axios.post(`${API_URL}/products`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            showNotification("Produkt dodany!", "success");
            setProduct({ name: '', price: '', category: filteredCategories[0] || 'HOODIES' });
            setImageFile(null);
            setPreviewUrl(null);
            fetchProducts();
        } catch (err) {
            showNotification("B³¹d dodawania produktu", "error");
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}/products/${deleteModal.productId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification(`Product deleted successfully`, 'success');
            setDeleteModal({ open: false, productId: null, productName: '' });
            fetchProducts();
        } catch (err) {
            showNotification("Error: Access denied", 'error');
        }
    };

    const handleUpdateProduct = async () => {
        const token = localStorage.getItem('token');
        const cleanPrice = parseFloat(newPrice);
        const cleanQuantity = parseInt(stockChange.quantity);

        if (cleanPrice < 0 || cleanQuantity < 0) {
            showNotification("Values cannot be negative", "error");
            return;
        }

        try {
            await axios.patch(`${API_URL}/products/${selectedProduct.product_id}/stock`, {
                size: stockChange.size,
                quantity: cleanQuantity
            }, { headers: { Authorization: `Bearer ${token}` } });

            await axios.patch(`${API_URL}/products/${selectedProduct.product_id}`, {
                price: cleanPrice
            }, { headers: { Authorization: `Bearer ${token}` } });

            showNotification(`Updated successfully`, 'success');
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            showNotification("Error updating database", "error");
        }
    };

    return (
        <div className="pt-40 px-10 max-w-[1200px] mx-auto min-h-screen space-y-20 pb-20 text-black relative">

            {/* POWIADOMIENIA */}
            <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 transform ${notification.visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
                <div className="flex items-center gap-4 px-8 py-5 border shadow-2xl min-w-[320px] bg-white border-black text-black">
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} className="text-red-500" />}
                    <p className="text-[11px] uppercase font-bold tracking-[0.2em]">{notification.message}</p>
                </div>
            </div>

            {/* DODAWANIE PRODUKTU */}
            <section className="bg-white border border-black p-10">
                <h1 className="text-2xl font-bold uppercase tracking-tighter mb-10">Add to Inventory</h1>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    <div className="md:col-span-4 space-y-4">
                        <div className="aspect-[3/4] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-[9px] uppercase font-bold text-gray-400">No Image Selected</p>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">
                                <Upload size={16} className="mr-2" /> Change Photo
                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                        <input type="text" placeholder="PRODUCT NAME" className="p-4 border border-black uppercase text-[12px] font-bold outline-none col-span-2"
                            value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} required />

                        <input type="number" placeholder="PRICE (PLN)" className="p-4 border border-black text-[12px] font-bold outline-none"
                            value={product.price} min="0" step="0.01"
                            onChange={e => {
                                const val = e.target.value;
                                if (val >= 0 || val === "") setProduct({ ...product, price: val });
                            }} required />

                        <select className="p-4 border border-black bg-white uppercase text-[12px] font-bold outline-none cursor-pointer"
                            value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })}>
                            {filteredCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <button type="submit" className="md:col-span-2 bg-black text-white py-5 uppercase tracking-[0.3em] font-bold hover:invert transition-all cursor-pointer">
                            Upload to Studio
                        </button>
                    </div>
                </form>
            </section>

            {/* LISTA PRODUKTÓW */}
            <section className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-black pb-4 gap-4">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter leading-none">Inventory Log</h2>
                    <div className="relative w-full md:w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="FILTER BY NAME..." className="p-3 pl-10 border border-black outline-none text-[10px] tracking-widest w-full uppercase font-bold"
                            value={adminSearchTerm} onChange={(e) => setAdminSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="border border-black">
                    {allProducts.map((p) => (
                        <div key={p.product_id} className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-black last:border-0 hover:bg-gray-50 transition-all group">
                            <div className="flex gap-8 items-center w-full">
                                <div className="w-16 h-20 bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img
                                        src={`${API_URL}/static/uploads/${p.product_id}.jpg`}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                        onError={(e) => { e.target.src = getImg(p.category); }}
                                        alt=""
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-4 uppercase font-bold text-[11px] tracking-tight">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-mono text-[9px]">ID: {p.product_id}</span>
                                        <span className="text-sm italic">{p.name}</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-gray-400 text-[9px]">Category</span>
                                        <span>{p.category}</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-gray-400 text-[9px]">Base Price</span>
                                        <span>{p.price} PLN</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-gray-400 text-[9px]">Total Stock</span>
                                        <span>{p.sizes?.reduce((acc, s) => acc + s.stock, 0) || 0} PCS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 mt-4 md:mt-0">
                                <button onClick={() => {
                                    setSelectedProduct(p);
                                    setNewPrice(p.price);
                                    setStockChange({ size: 'M', quantity: 0 });
                                    setIsModalOpen(true);
                                }}
                                    className="text-black text-[10px] font-bold uppercase tracking-widest border-b border-black hover:opacity-50">
                                    Manage
                                </button>
                                <button onClick={() => setDeleteModal({ open: true, productId: p.product_id, productName: p.name })}
                                    className="text-red-500 text-[10px] font-bold uppercase tracking-widest border-b border-red-500 hover:opacity-50">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODAL EDYCJI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] backdrop-blur-md p-4">
                    <div className="bg-white p-10 w-full max-w-md border border-black space-y-8 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 hover:rotate-90 transition-transform">
                            <X size={24} />
                        </button>
                        <h3 className="text-3xl font-bold uppercase tracking-tighter leading-none border-b border-black pb-4">Edit Product</h3>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Update Price (PLN)</label>
                                <input type="number" className="w-full p-4 border border-black font-bold outline-none text-xl"
                                    value={newPrice} min="0" step="0.01"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val >= 0 || val === "") setNewPrice(val);
                                    }} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Stock Management ({stockChange.size})</label>
                                <div className="flex gap-1 bg-black p-[1px]">
                                    {['S', 'M', 'L', 'XL'].map(size => (
                                        <button key={size} onClick={() => setStockChange({ ...stockChange, size })}
                                            className={`flex-1 py-4 text-[11px] font-bold transition-all ${stockChange.size === size ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-900'}`}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center border border-black h-16">
                                <button onClick={() => setStockChange({ ...stockChange, quantity: Math.max(0, stockChange.quantity - 1) })} className="p-4 hover:bg-gray-100 flex-1 h-full flex justify-center items-center"><Minus size={16} /></button>
                                <input type="number" className="w-20 text-center font-bold outline-none text-lg border-x border-black h-full"
                                    value={stockChange.quantity} min="0"
                                    onChange={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        setStockChange({ ...stockChange, quantity: Math.max(0, val) });
                                    }} />
                                <button onClick={() => setStockChange({ ...stockChange, quantity: stockChange.quantity + 1 })} className="p-4 hover:bg-gray-100 flex-1 h-full flex justify-center items-center"><Plus size={16} /></button>
                            </div>

                            <button onClick={handleUpdateProduct} className="w-full bg-black text-white py-6 font-bold uppercase text-[11px] tracking-[0.3em] hover:invert transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL USUWANIA */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] p-4">
                    <div className="bg-white p-12 max-w-sm w-full space-y-8 border border-black shadow-2xl">
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-bold uppercase text-red-600">Warning</h3>
                            <p className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                                Proceeding will permanently erase <br /><span className="underline">{deleteModal.productName}</span> and its assets.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all">Confirm Removal</button>
                            <button onClick={() => setDeleteModal({ open: false, productId: null, productName: '' })} className="w-full bg-white text-black border border-black py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Abort</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;