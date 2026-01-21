import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_URL, CATEGORIES, getImg } from '../constants';

const SearchResults = () => {
    const { search } = useLocation();
    const query = new URLSearchParams(search).get('q') || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 12;

    const [openSections, setOpenSections] = useState({ sort: true, category: true, price: true });

    // --- STANY ZATWIERDZONE (Wyzwalaj¹ API) ---
    const [appliedSortBy, setAppliedSortBy] = useState('relevance');
    const [appliedCats, setAppliedCats] = useState([]);
    const [appliedPriceRange, setAppliedPriceRange] = useState([0, 5000]);

    // --- STANY TYMCZASOWE (Bufory) ---
    const [tempSortBy, setTempSortBy] = useState('relevance');
    const [tempCats, setTempCats] = useState([]);
    const [tempPriceRange, setTempPriceRange] = useState([0, 5000]);

    const [catCounts, setCatCounts] = useState({});

    // Kategorie z constants (bez NEW ARRIVALS i ALL)
    const filteredCategories = CATEGORIES.filter(c => c !== "NEW ARRIVALS" && c !== "ALL");

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products/search`, {
                params: {
                    q: query,
                    limit: resultsPerPage,
                    offset: (currentPage - 1) * resultsPerPage,
                    categories: appliedCats.length > 0 ? appliedCats.join(',') : null,
                    min_price: appliedPriceRange[0],
                    max_price: appliedPriceRange[1],
                    sort: appliedSortBy
                }
            });
            setProducts(res.data);

            // Liczenie kategorii z wyników
            const counts = res.data.reduce((acc, p) => {
                acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
            }, {});
            setCatCounts(counts);

        } catch (err) {
            console.error("B³¹d wyszukiwania:", err);
        } finally {
            setLoading(false);
        }
    }, [query, currentPage, appliedCats, appliedPriceRange, appliedSortBy]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, appliedCats, appliedPriceRange, appliedSortBy]);

    const handleApplyFilters = () => {
        setAppliedPriceRange(tempPriceRange);
        setAppliedCats(tempCats);
        setAppliedSortBy(tempSortBy);
        setCurrentPage(1);
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="pt-24 min-h-screen bg-white text-black font-sans uppercase tracking-widest">
            <style>{`
                .dual-range { height: 2px; position: relative; background: #e5e7eb; border-radius: 2px; }
                .dual-range input[type="range"] { 
                    position: absolute; width: 100%; pointer-events: none; -webkit-appearance: none; background: none; top: -5px; 
                }
                .dual-range input[type="range"]::-webkit-slider-thumb { 
                    height: 14px; width: 14px; border-radius: 0; background: black; pointer-events: auto; -webkit-appearance: none; cursor: pointer; border: 1px solid white;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; }
                
                img:-moz-broken { display: none !important; }
                img:not([src]), img[src=""] { display: none !important; }
            `}</style>

            <div className="px-10 py-10 border-b border-black flex justify-between items-end bg-white">
                <h1 className="text-2xl font-bold tracking-tighter">
                    {loading ? "SEARCHING..." : `Results for "${query}" (${products.length})`}
                </h1>
                <div className="text-[10px] font-bold">Home / Search</div>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* SIDEBAR FILTRÓW */}
                <div className="w-full md:w-80 border-r border-b md:border-b-0 border-black p-10 space-y-10 bg-white min-h-full">

                    <button
                        onClick={handleApplyFilters}
                        className="w-full bg-black text-white text-[10px] py-4 uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 transition-all sticky top-24 z-20"
                    >
                        Apply Filters
                    </button>

                    {/* SORTOWANIE */}
                    <div className="pt-4">
                        <button onClick={() => toggleSection('sort')} className="w-full flex justify-between items-center text-[10px] font-bold">
                            Sort {openSections.sort ? <Minus size={12} /> : <Plus size={12} />}
                        </button>
                        {openSections.sort && (
                            <div className="mt-4 space-y-2 text-[11px] text-gray-400">
                                {['relevance', 'low', 'high'].map(type => (
                                    <p key={type}
                                        onClick={() => setTempSortBy(type)}
                                        className={`cursor-pointer hover:text-black transition-colors ${tempSortBy === type ? 'text-black font-bold' : ''}`}>
                                        {type === 'relevance' ? 'Relevance' : type === 'low' ? 'Price: Low to High' : 'Price: High to Low'}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* KATEGORIE */}
                    <div>
                        <button onClick={() => toggleSection('category')} className="w-full flex justify-between items-center text-[10px] font-bold">
                            Category {openSections.category ? <Minus size={12} /> : <Plus size={12} />}
                        </button>
                        {openSections.category && (
                            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredCategories.map(cat => (
                                    <label key={cat} className="flex justify-between items-center text-[10px] cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={tempCats.includes(cat)}
                                                onChange={() => setTempCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                                                className="accent-black h-3 w-3 rounded-none"
                                            />
                                            <span className={`transition-all ${tempCats.includes(cat) ? 'font-black text-black' : 'text-gray-500 group-hover:text-black'}`}>{cat}</span>
                                        </div>
                                        <span className="text-gray-300 text-[9px]">({catCounts[cat] || 0})</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CENA */}
                    <div>
                        <button onClick={() => toggleSection('price')} className="w-full flex justify-between items-center text-[10px] font-bold">
                            Price Range {openSections.price ? <Minus size={12} /> : <Plus size={12} />}
                        </button>
                        {openSections.price && (
                            <div className="mt-6 space-y-6">
                                <div className="dual-range">
                                    <input
                                        type="range" min="0" max="5000" step="10"
                                        value={tempPriceRange[0]}
                                        onChange={(e) => setTempPriceRange([Math.min(parseInt(e.target.value), tempPriceRange[1] - 10), tempPriceRange[1]])}
                                    />
                                    <input
                                        type="range" min="0" max="5000" step="10"
                                        value={tempPriceRange[1]}
                                        onChange={(e) => setTempPriceRange([tempPriceRange[0], Math.max(parseInt(e.target.value), tempPriceRange[0] + 10)])}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span>{tempPriceRange[0]} PLN</span>
                                    <span>{tempPriceRange[1]} PLN</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIATKA PRODUKTÓW - BEZ BG-BLACK */}
                <div className="flex-1 bg-white flex flex-col border-b border-black">
                    {loading && products.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-20 text-[10px] animate-pulse">Synchronizing...</div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 bg-white">
                            {products.map((p, index) => (
                                <Link
                                    to={`/product/${p.product_id}`}
                                    key={p.product_id}
                                    className={`bg-white p-10 group no-underline text-black border-b border-black flex flex-col
                                        ${index % 2 !== 1 ? 'border-r md:border-r-0' : ''} 
                                        ${index % 3 !== 2 ? 'lg:border-r' : 'lg:border-r-0'}
                                    `}
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-white mb-6 relative">
                                        <img
                                            src={`${API_URL}/static/uploads/${p.product_id}.jpg`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 block"
                                            alt={p.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <div className="mt-auto flex justify-between text-[10px] font-bold">
                                        <span>{p.name}</span>
                                        <span>{p.price} PLN</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-20 text-center uppercase tracking-[0.3em] text-[10px] text-gray-400">
                            No products matching criteria.
                        </div>
                    )}

                    {/* PAGINACJA */}
                    <div className="p-10 flex justify-center items-center gap-10 mt-auto bg-white border-t border-black">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                            className="disabled:opacity-20 hover:scale-110 transition-transform cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-[10px] font-bold">PAGE {currentPage}</span>
                        <button
                            disabled={products.length < resultsPerPage}
                            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                            className="disabled:opacity-20 hover:scale-110 transition-transform cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;