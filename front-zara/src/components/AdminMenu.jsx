import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, ArrowLeft } from 'lucide-react';

const AdminMenu = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-40 min-h-screen bg-white px-10 font-none">
            <div className="max-w-[900px] mx-auto">
                <button
                    onClick={() => navigate('/account')}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold mb-12 hover:opacity-50 transition-all italic"
                >
                    <ArrowLeft size={14} /> Back to Account
                </button>

                <h1 className="text-4xl font-bold uppercase tracking-tighter italic mb-16 border-b-2 border-black pb-6">
                    Control Panel
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* PRODUKTY */}
                    <div
                        onClick={() => navigate('/admin/products')}
                        className="group border-2 border-black p-12 cursor-pointer hover:bg-black hover:text-white transition-all duration-700"
                    >
                        <Package size={40} strokeWidth={1} className="mb-8" />
                        <h2 className="text-2xl font-bold uppercase italic mb-3">Products Manager</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100">Stock & Catalog</p>
                    </div>

                    {/* ZAMÓWIENIA */}
                    <div
                        onClick={() => navigate('/admin/orders')}
                        className="group border-2 border-black p-12 cursor-pointer hover:bg-black hover:text-white transition-all duration-700"
                    >
                        <ShoppingBag size={40} strokeWidth={1} className="mb-8" />
                        <h2 className="text-2xl font-bold uppercase italic mb-3">Order Manager</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100">Customer Sales</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMenu;