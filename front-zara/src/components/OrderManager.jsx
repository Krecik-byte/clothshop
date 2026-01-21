import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../constants';
import { ArrowLeft, CheckCircle, Truck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/orders`);
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error("B³¹d pobierania zamówieñ:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            // Wysy³amy status jako query param lub body w zale¿noœci od Twojego backendu
            // Tutaj dopasowane do patch("/admin/orders/{order_id}/status")
            await axios.patch(`${API_URL}/admin/orders/${orderId}/status?new_status=${newStatus}`);

            // Lokalna aktualizacja stanu, ¿eby nie prze³adowywaæ strony
            setOrders(prev => prev.map(o =>
                o.order_id === orderId ? { ...o, status: newStatus } : o
            ));
        } catch (err) {
            alert("B³¹d przy zmianie statusu");
        }
    };

    if (loading) return <div className="pt-40 text-center uppercase tracking-widest italic">Loading Orders...</div>;

    return (
        <div className="pt-40 px-6 pb-20 max-w-[1200px] mx-auto font-none">
            {/* Nag³ówek i Powrót */}
            <div className="flex justify-between items-end mb-12 border-b-2 border-black pb-6">
                <div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 hover:opacity-50 transition-all italic"
                    >
                        <ArrowLeft size={14} /> Back to Menu
                    </button>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter italic">Order Manager</h1>
                </div>
                <div className="text-[10px] uppercase tracking-widest opacity-50 italic">
                    Total Orders: {orders.length}
                </div>
            </div>

            {/* Tabela Zamówieñ */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-[11px] uppercase tracking-[0.2em] border-b border-black text-left">
                            <th className="py-4 px-2">ID / Date</th>
                            <th className="py-4 px-2">Customer</th>
                            <th className="py-4 px-2">Items</th>
                            <th className="py-4 px-2 text-right">Total</th>
                            <th className="py-4 px-2 text-right">Status / Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                {/* ID i Data */}
                                <td className="py-8 px-2">
                                    <div className="font-bold italic text-lg">#{order.order_id}</div>
                                    <div className="text-[10px] uppercase opacity-50">
                                        {new Date(order.order_date).toLocaleDateString()}
                                    </div>
                                </td>

                                {/* Klient */}
                                <td className="py-8 px-2 text-[13px]">
                                    <div className="font-bold uppercase tracking-tight">{order.email}</div>
                                </td>

                                {/* Produkty */}
                                <td className="py-8 px-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="text-[11px] uppercase mb-1">
                                            <span className="font-bold">{item.name}</span>
                                            <span className="opacity-60 ml-2">[{item.size}] x{item.quantity}</span>
                                        </div>
                                    ))}
                                </td>

                                {/* Kwota */}
                                <td className="py-8 px-2 text-right">
                                    <div className="font-bold italic text-lg">{order.total_amount} PLN</div>
                                </td>

                                {/* Status i Przyciski Akcji */}
                                <td className="py-8 px-2 text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        {/* Wyœwietlanie obecnego statusu */}
                                        <span className={`text-[10px] px-3 py-1 font-bold uppercase tracking-widest mb-2 ${order.status === 'Paid' ? 'bg-black text-white' :
                                                order.status === 'Shipped' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                                            }`}>
                                            {order.status}
                                        </span>

                                        {/* Przyciski zmiany statusu */}
                                        <div className="flex gap-2">
                                            {order.status === 'Paid' && (
                                                <button
                                                    onClick={() => updateStatus(order.order_id, 'Shipped')}
                                                    className="border border-black p-2 hover:bg-black hover:text-white transition-all title='Mark as Shipped'"
                                                >
                                                    <Truck size={16} />
                                                </button>
                                            )}
                                            {order.status !== 'Delivered' && (
                                                <button
                                                    onClick={() => updateStatus(order.order_id, 'Delivered')}
                                                    className="border border-black p-2 hover:bg-black hover:text-white transition-all title='Mark as Delivered'"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="py-20 text-center uppercase tracking-[0.3em] opacity-30 italic">
                        No processed orders found
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManager;