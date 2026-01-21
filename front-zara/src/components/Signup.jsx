import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../constants';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Tworzymy FormData, bo backend FastAPI u¿ywa Form(...)
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);

        try {
            await axios.post(`${API_URL}/signup`, data);
            // Po udanej rejestracji przekierowujemy do logowania
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || "B³¹d podczas rejestracji. Spróbuj ponownie.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-40 min-h-screen bg-white flex flex-col items-center px-6">
            <h1 className="text-[13px] uppercase tracking-[0.4em] font-bold mb-10">Create Account</h1>

            <form onSubmit={handleSignup} className="w-full max-w-[450px] space-y-4">
                <input
                    name="username"
                    type="text"
                    placeholder="Username"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-black transition-colors text-[13px] tracking-widest uppercase"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-black transition-colors text-[13px] tracking-widest uppercase"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-black transition-colors text-[13px] tracking-widest uppercase"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {error && <p className="text-red-500 text-[11px] uppercase tracking-widest text-center font-bold">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1a1a1a] text-white py-4 text-[12px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-colors disabled:bg-gray-400"
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4 text-[11px] uppercase tracking-widest">
                <p className="text-gray-400">
                    Already have an account? <Link to="/login" className="text-black border-b border-black pb-0.5 font-bold">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;