import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../constants';

const Account = ({ setToken }) => {
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const ADMIN_EMAIL = "DAWID@SPOKO.PL";

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (setToken) setToken(null);
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const userRes = await axios.get(`${API_URL}/me`, config);
                setUserData(userRes.data);

                try {
                    const ordersRes = await axios.get(`${API_URL}/orders/history`, config);
                    setOrders(ordersRes.data);
                } catch (orderErr) {
                    console.error("Order history failed", orderErr);
                }
            } catch (err) {
                if (err.response?.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) return null;

    const isAdmin = userData?.email?.toUpperCase() === ADMIN_EMAIL || userData?.is_admin === true;

    return (
        <div className="pt-32 min-h-screen bg-white font-sans text-[13px]">
            <div className="max-w-[1600px] mx-auto px-8">

                {/* BREADCRUMBS & TITLE */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-[24px] tracking-tight">Account</h1>
                    <div className="flex gap-2 text-[11px] uppercase tracking-widest text-gray-500">
                        <Link to="/" className="hover:text-black">Home</Link>
                        <span>/</span>
                        <span className="text-black">Account</span>
                    </div>
                </div>

                <div className="border-t border-black pt-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">

                        {/* TABELA ZAMÓWIEÑ */}
                        <div className="lg:col-span-3 pr-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="py-3 font-bold uppercase text-[11px] tracking-widest w-[20%]">Order</th>
                                        <th className="py-3 font-bold uppercase text-[11px] tracking-widest w-[30%]">Date</th>
                                        <th className="py-3 font-bold uppercase text-[11px] tracking-widest w-[30%]">Status</th>
                                        <th className="py-3 font-bold uppercase text-[11px] tracking-widest text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-10 text-gray-400 font-light">You haven't placed any orders yet.</td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.order_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 font-medium underline underline-offset-4 decoration-gray-300 hover:decoration-black">
                                                    <Link to={`/account/order/${order.order_id}`}>#{order.order_id}</Link>
                                                </td>
                                                <td className="py-4 text-gray-600">
                                                    {new Date(order.order_date).toLocaleDateString('pl-PL')}
                                                </td>
                                                <td className="py-4 text-gray-600">{order.status}</td>
                                                <td className="py-4 text-right font-medium">
                                                    {parseFloat(order.total_amount).toFixed(2)} PLN
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PANEL BOCZNY (DANE U¯YTKOWNIKA) */}
                        <div className="lg:col-span-1 lg:border-l border-black pl-10 pt-0">
                            <h2 className="text-[14px] mb-6 tracking-tight font-medium uppercase">Account details</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Username</p>
                                    <p className="text-black font-medium tracking-tight">{userData?.username}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Email</p>
                                    <p className="text-black font-medium tracking-tight">{userData?.email}</p>
                                </div>
                            </div>

                            {/* GUZIK ADMINA */}
                            {isAdmin && (
                                <div className="mt-12 pt-10 border-t border-gray-100">
                                    <Link
                                        to="/admin"
                                        className="inline-block w-full bg-black text-white text-center py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black border border-black transition-all"
                                    >
                                        Admin Panel
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* STOPKA KONTA */}
                <div className="mt-20 border-t border-gray-200 pt-10 flex justify-between items-center pb-20">
                    <p className="text-[18px] font-normal">Welcome back, {userData?.username}!</p>
                    <button
                        onClick={handleLogout}
                        className="text-[13px] underline underline-offset-4 hover:decoration-2 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Account;