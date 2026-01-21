import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Minus, Plus } from 'lucide-react';
import { getImg, API_URL } from '../constants';

const ProductPage = ({ addToCart }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

    const selectedSizeData = product?.sizes?.find(s => s.size === selectedSize);
    const maxAvailable = selectedSizeData ? selectedSizeData.stock : 1;

    useEffect(() => {
        const fetchFullProductData = async () => {
            setLoading(true);
            try {
                const productRes = await axios.get(`${API_URL}/products/${id}`);
                const currentProduct = productRes.data;
                setProduct(currentProduct);

                const recommendationsRes = await axios.get(`${API_URL}/products/search`, {
                    params: {
                        categories: currentProduct.category,
                        limit: 5
                    }
                });

                const filteredRecs = recommendationsRes.data
                    .filter(p => p.product_id !== parseInt(id))
                    .slice(0, 4);

                setRelatedProducts(filteredRecs);
            } catch (err) {
                console.error("B³¹d ³adowania danych:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFullProductData();
        setSelectedSize(null);
        setQuantity(1);
        window.scrollTo(0, 0);
    }, [id]);

    const handleSizeSelect = (size, stock) => {
        setSelectedSize(size);
        if (quantity > stock) {
            setQuantity(stock);
        }
    };

    if (loading) return (
        <div className="pt-40 text-center uppercase tracking-[0.5em] font-bold animate-pulse">
            Loading WSN Studio...
        </div>
    );

    if (!product) return (
        <div className="pt-40 text-center uppercase font-bold text-red-500">
            Product not found
        </div>
    );

    const getProductImage = (pId) => `${API_URL}/static/uploads/${pId}.jpg`;

    return (
        <div className="pt-20 bg-white min-h-screen">
            <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row">

                {/* LEWA STRONA: MOZAIKA ZDJÊÆ */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-black border-r border-black">
                    {[1, 2, 3, 4].map((_, index) => (
                        <div key={index} className="bg-[#F9F9F9] aspect-[3/4] overflow-hidden group">
                            <img
                                src={getProductImage(product.product_id)}
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${index > 1 ? 'opacity-90' : ''}`}
                                alt={`view-${index}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getImg(product.category);
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* PRAWA STRONA: PANEL ZAKUPOWY */}
                <div className="w-full md:w-[500px] md:sticky md:top-20 h-auto md:h-[calc(100vh-80px)] overflow-y-auto bg-white p-12 flex flex-col justify-between border-b border-black md:border-b-0">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl font-bold uppercase tracking-tighter">{product.name}</h1>
                            <span className={`text-[10px] px-2 py-1 font-bold uppercase tracking-widest ${product.sizes?.reduce((acc, s) => acc + s.stock, 0) > 0
                                ? 'bg-black text-white'
                                : 'bg-red-600 text-white'
                                }`}>
                                {product.sizes?.reduce((acc, s) => acc + s.stock, 0) > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <p className="text-lg mb-10 font-bold">{product.price} PLN</p>

                        {/* WYBÓR ROZMIARU */}
                        <div className="mb-10">
                            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-bold text-gray-400">
                                Size: {selectedSize || 'Select'}
                                {selectedSize && <span className="text-black ml-2 opacity-100">({selectedSizeData?.stock} available)</span>}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {product.sizes && product.sizes.map(s => (
                                    <button
                                        key={s.size}
                                        disabled={s.stock === 0}
                                        onClick={() => handleSizeSelect(s.size, s.stock)}
                                        className={`w-14 h-14 border text-[12px] font-bold transition-all relative
                                            ${selectedSize === s.size ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}
                                            ${s.stock === 0 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {s.size}
                                        {s.stock === 0 && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-black -rotate-45"></div></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* WYBÓR ILOŒCI */}
                        <div className="space-y-4">
                            <div className="flex items-center border border-black h-14">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 bg-transparent cursor-pointer border-none"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="flex-1 text-center font-bold border-x border-black h-full flex items-center justify-center text-[13px]">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className={`flex-1 h-full flex items-center justify-center hover:bg-gray-50 bg-transparent border-none
                                        ${quantity >= maxAvailable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                                    disabled={quantity >= maxAvailable}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <button
                                disabled={!selectedSize || maxAvailable === 0}
                                onClick={() => addToCart(product, selectedSize, quantity)}
                                className={`w-full py-6 text-[11px] uppercase tracking-[0.5em] font-bold border transition-all duration-500
                                    ${selectedSize ? 'bg-black text-white border-black hover:invert cursor-pointer' : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'}`}
                            >
                                {selectedSize ? "Add to bag" : "Select Size"}
                            </button>

                            {selectedSize && quantity === maxAvailable && (
                                <p className="text-[9px] text-red-600 uppercase font-bold text-center tracking-widest animate-pulse">
                                    Maximum stock reached for this size
                                </p>
                            )}
                        </div>
                    </div>

                    {/* OPIS */}
                    <div className="mt-10 border-t border-black pt-4">
                        <button
                            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                            className="w-full flex justify-between items-center py-2 bg-transparent border-none cursor-pointer"
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Description</span>
                            {isDescriptionOpen ? <Minus size={12} /> : <Plus size={12} />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ${isDescriptionOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <p className="text-[12px] text-gray-600 leading-relaxed uppercase tracking-wider">
                                Crafted from heavyweight cotton. Features custom WSN STUDIO patterns and industrial hardware. Made for the modern silhouette.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* REKOMENDACJE */}
            {relatedProducts.length > 0 && (
                <div className="border-t border-black bg-white">
                    <div className="p-10 border-b border-black">
                        <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold text-center md:text-left">You may also like</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-black border-b border-black">
                        {relatedProducts.map(rp => (
                            <Link
                                to={`/product/${rp.product_id}`}
                                key={rp.product_id}
                                className="bg-white p-10 group no-underline text-black hover:bg-gray-50 transition-colors"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-[#F9F9F9] mb-6 border border-transparent group-hover:border-black transition-all">
                                    <img
                                        src={getProductImage(rp.product_id)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        alt={rp.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getImg(rp.category);
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 uppercase tracking-widest text-[11px] font-bold">
                                    <div className="flex justify-between">
                                        <span>{rp.name}</span>
                                        <span>{rp.price} PLN</span>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-light">{rp.category}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;