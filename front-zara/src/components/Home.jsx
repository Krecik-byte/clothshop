import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../constants'; // Upewnij siê, ¿e masz tu adres backendu

const Home = () => {
    const navigate = useNavigate();
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    // POBIERANIE 6 NAJNOWSZYCH PRODUKTÓW
    useEffect(() => {
        const fetchNewest = async () => {
            try {
                // Pobieramy produkty z limitem 6 (Twój backend zwraca je od najwy¿szego ID)
                const res = await axios.get(`${API_URL}/products`, {
                    params: { limit: 6, offset: 0 }
                });
                setNewArrivals(res.data);
            } catch (err) {
                console.error("Error fetching newest products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNewest();
    }, []);

    return (
        <div className="bg-white min-h-screen text-black">

            {/* 1. HERO SECTION */}
            <section className="relative h-screen w-full overflow-hidden bg-black">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90">
                    <source src="/home.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/10 text-center">
                    <h1 className="text-5xl md:text-7xl font-light tracking-[0.4em] uppercase">COLLECTION 01</h1>
                    <button
                        onClick={() => navigate('/search')}
                        className="mt-8 px-10 py-4 border border-white hover:bg-white hover:text-black transition-all duration-500 uppercase text-[10px] tracking-[0.3em]"
                    >
                        SHOP NOW
                    </button>
                </div>
            </section>

            {/* 2. NEW ARRIVALS */}
            <section className="max-w-[1920px] mx-auto border-t border-black">
                
                <div className="flex justify-between items-center px-10 py-8 border-b border-black">
                    <h2 className="text-[14px] font-medium uppercase tracking-[0.15em]">New Arrivals</h2>
                    <button
                        onClick={() => navigate('/search')}
                        className="text-[11px] underline underline-offset-8 uppercase tracking-[0.05em]"
                    >
                        View all products
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {newArrivals.map((product, index) => (
                        <div
                            key={product.product_id}
                            className={`group cursor-pointer flex flex-col border-black
                                ${index % 3 !== 2 ? 'lg:border-r' : ''} 
                                border-b`}
                            onClick={() => navigate(`/product/${product.product_id}`)}
                        >
                            <div className="p-10 aspect-[3/4] bg-white overflow-hidden">
                                <img
                                    // U¿ywamy dynamicznego adresu zdjêcia z Twojego serwera
                                    src={`${API_URL}/static/uploads/${product.product_id}.jpg`}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:opacity-80 transition-all duration-700"
                                    // Fallback gdyby zdjêcia nie by³o
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/600x800?text=IMAGE+UNAVAILABLE'}
                                />
                            </div>

                            <div className="mt-auto px-10 py-6 border-t border-black flex justify-between items-center bg-white">
                                <h3 className="text-[11px] uppercase tracking-[0.1em] font-bold">{product.name}</h3>
                                <p className="text-[11px] font-bold tracking-widest">{product.price} PLN</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. FOOTER */}
            <footer className="py-24 border-t border-black flex flex-col items-center justify-center">
                <div className="w-[1px] h-12 bg-black mb-4"></div>
                <p className="text-[9px] tracking-[0.6em] text-gray-400 uppercase">KRYSZTAL STUDIO</p>
            </footer>

        </div>
    );
};

export default Home;