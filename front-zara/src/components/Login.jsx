import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../constants';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        // U¿ywamy URLSearchParams zamiast FormData, co jest bardziej niezawodne przy application/x-www-form-urlencoded w FastAPI
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        try {
            console.log("Próba logowania dla:", email);
            const res = await axios.post(`${API_URL}/login`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log("OdpowiedŸ serwera:", res.data);

            const token = res.data.access_token;

            if (token) {
                // Najpierw zapisujemy do localStorage
                localStorage.setItem('token', token);

                // Ustawiamy nag³ówek dla axiosa od razu, ¿eby nastêpne zapytanie /me go widzia³o
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Aktualizujemy stan w App.jsx
                setToken(token);

                console.log("Token zapisany pomyœlnie. Przekierowujê...");
                navigate('/account');
            } else {
                setError("Serwer nie zwróci³ tokena dostêpu.");
            }

        } catch (err) {
            console.error("B³¹d logowania:", err.response);
            const errorMsg = err.response?.data?.detail;

            // Jeœli detail jest tablic¹ (b³¹d walidacji pydantic), wyci¹gamy pierwszy komunikat
            if (Array.isArray(errorMsg)) {
                setError(errorMsg[0].msg);
            } else {
                setError(errorMsg || "Nieprawid³owe dane logowania");
            }
        }
    };

    return (
        <div className="pt-40 min-h-screen bg-white flex flex-col items-center px-6">
            <h1 className="text-[13px] uppercase tracking-[0.4em] font-bold mb-10">Account</h1>

            <form onSubmit={handleLogin} className="w-full max-w-[450px] space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-black transition-colors text-[13px] tracking-widest"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-black transition-colors text-[13px] tracking-widest"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <div className="bg-red-50 p-3 border border-red-200">
                        <p className="text-red-600 text-[11px] uppercase tracking-widest text-center">
                            {error}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-[#1a1a1a] text-white py-4 text-[12px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-colors"
                >
                    Login
                </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4 text-[11px] uppercase tracking-widest">
                <p className="text-gray-400">
                    Don't have an account? <Link to="/signup" className="text-black border-b border-black pb-0.5">Create one</Link>
                </p>
                <Link to="/recover" className="text-gray-400 border-b border-gray-300 pb-0.5">Recover password</Link>
            </div>
        </div>
    );
};

export default Login;