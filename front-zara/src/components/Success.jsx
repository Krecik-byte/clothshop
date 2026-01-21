import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const Success = () => {
    return (
        <div className="pt-60 min-h-screen bg-white px-10 text-center font-none">
            <div className="max-w-[600px] mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center">
                    <CheckCircle2 size={60} strokeWidth={1} className="text-black" />
                </div>

                <h1 className="text-5xl font-bold uppercase tracking-tighter italic">
                    Order Confirmed
                </h1>

                <p className="text-[12px] uppercase tracking-[0.3em] leading-loose opacity-60">
                    Your payment was successful. We are now preparing your pieces for shipment.
                    A confirmation has been sent to your account dashboard.
                </p>

                <div className="pt-10 flex flex-col gap-4 items-center">
                    <Link
                        to="/account"
                        className="w-full max-w-[300px] bg-black text-white py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:invert transition-all duration-500 italic flex items-center justify-center gap-2 group"
                    >
                        View Order History
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        to="/"
                        className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:opacity-50 transition-all italic"
                    >
                        Back to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Success;