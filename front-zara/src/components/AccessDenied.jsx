import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-60 min-h-screen bg-white px-10 text-center font-none">
            <div className="max-w-[600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-center">
                    <ShieldAlert size={80} strokeWidth={1} className="text-black" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-bold uppercase tracking-tighter italic">
                        403
                    </h1>
                    <h2 className="text-xl font-bold uppercase tracking-widest italic">
                        Access Denied
                    </h2>
                </div>

                <p className="text-[11px] uppercase tracking-[0.3em] leading-loose opacity-50 max-w-[400px] mx-auto">
                    You do not have the required administrative privileges to access this sector.
                    This incident has been logged.
                </p>

                <div className="pt-10">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full max-w-[300px] bg-black text-white py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:invert transition-all duration-500 italic flex items-center justify-center gap-3 group border border-black"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;