import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import SearchOverlay from './components/SearchOverlay';
import SearchResults from './components/SearchResults';
import CartDrawer from './components/CartDrawer';
import ProductPage from './components/ProductPage';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Account from './components/Account';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import AdminMenu from './components/AdminMenu';
import OrderManager from './components/OrderManager';
import Success from './components/Success';
import AccessDenied from './components/AccessDenied';
import Home from './components/Home'; // NOWY KOMPONENT Z FILMEM
import { API_URL } from './constants';

// --- KOMPONENT STRA¯NIK (ADMIN GUARD) ---
const AdminRoute = ({ user, children }) => {
    const ADMIN_EMAIL = "DAWID@SPOKO.PL";

    if (localStorage.getItem('token') && !user) {
        return <div className="pt-40 text-center animate-pulse">Verifying credentials...</div>;
    }

    // Sprawdzamy maila ignoruj¹c wielkoœæ liter
    if (!user || user.email.toUpperCase() !== ADMIN_EMAIL) {
        console.log("Odmowa dostêpu dla:", user?.email);
        return <Navigate to="/access-denied" />; // U¿yj Navigate zamiast komponentu, ¿eby zmieniæ URL
    }

    return children;
};

const App = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const [token, setToken] = useState(localStorage.getItem('token')); // To musi tu byæ!
    const [user, setUser] = useState(null);

    const mapCartItems = (items) => {
        return items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            category: item.category,
            size: item.size_name || item.size,
            quantity: item.quantity
        }));
    };

    useEffect(() => {
        const initApp = async () => {
            try {
                const res = await axios.get(`${API_URL}/products`);
                setProducts(res.data);
            } catch (err) { console.error("Error fetching products"); }

            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
                    const userRes = await axios.get(`${API_URL}/me`);
                    setUser(userRes.data);

                    const localCart = JSON.parse(localStorage.getItem('wsn_cart') || "[]");
                    if (localCart.length > 0) {
                        for (const item of localCart) {
                            try {
                                await axios.put(`${API_URL}/cart/add`, {
                                    product_id: item.product_id,
                                    size_name: item.size,
                                    quantity: item.quantity
                                });
                            } catch (e) { console.error("Sync item failed", e); }
                        }
                        localStorage.removeItem('wsn_cart');
                    }

                    const cartRes = await axios.get(`${API_URL}/cart`);
                    setCart(mapCartItems(cartRes.data));
                } catch (err) {
                    console.error("B³¹d po³¹czenia:", err);

                    // Wyloguj TYLKO jeœli serwer wyraŸnie mówi, ¿e token jest niewa¿ny (401)
                    if (err.response && err.response.status === 401) {
                        console.warn("Sesja wygas³a. Wylogowujê...");
                        handleLogout();
                    }
                    // Jeœli b³¹d to 500 albo brak neta - NIE wylogowujemy!
                }
            } else {
                const savedCart = localStorage.getItem('wsn_cart');
                if (savedCart) setCart(JSON.parse(savedCart));
            }
        };
        initApp();
    }, [token]);

    useEffect(() => {
        if (!token && cart.length > 0) {
            localStorage.setItem('wsn_cart', JSON.stringify(cart));
        }
    }, [cart, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const addToCart = async (product, size, qty = 1) => {
        if (token) {
            try {
                await axios.put(`${API_URL}/cart/add`, {
                    product_id: product.product_id,
                    size_name: size,
                    quantity: qty
                });
            } catch (err) { console.error("DB Sync Error (Add)"); }
        }

        setCart(prev => {
            const exists = prev.find(item => item.product_id === product.product_id && item.size === size);
            if (exists) {
                return prev.map(item => (item.product_id === product.product_id && item.size === size)
                    ? { ...item, quantity: item.quantity + qty } : item);
            }
            return [...prev, { ...product, size: size, quantity: qty }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = async (productId, size, delta) => {
        if (token) {
            try {
                await axios.put(`${API_URL}/cart/add`, {
                    product_id: productId,
                    size_name: size,
                    quantity: delta
                });
            } catch (err) { console.error("DB Sync Error (Update)"); }
        }

        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.product_id === productId && item.size === size) {
                    const newQuantity = item.quantity + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    const removeFromCart = async (id, size) => {
        if (token) {
            try {
                await axios.delete(`${API_URL}/cart/remove`, {
                    data: { product_id: id, size_name: size }
                });
            } catch (err) { console.error("DB Sync Error (Remove)"); }
        }
        setCart(prev => prev.filter(item => !(item.product_id === id && item.size === size)));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('wsn_cart');
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <Router>
            <div className="min-h-screen bg-white text-black font-light relative">
                <SearchOverlay
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                />

                <Header
                    setIsSearchOpen={setIsSearchOpen}
                    setIsCartOpen={setIsCartOpen}
                    cartCount={cartCount}
                    isShopMenuOpen={isShopMenuOpen}
                    setIsShopMenuOpen={setIsShopMenuOpen}
                    setSelectedCategory={setSelectedCategory}
                    user={user}
                />

                <CartDrawer
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cart={cart}
                    cartTotal={cartTotal}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                />

                <Routes>
                    {/* STRONA G£ÓWNA Z FILMEM */}
                    <Route path="/" element={<Home />} />

                    {/* POZOSTA£E TRASY */}
                    <Route path="/product/:id" element={<ProductPage products={products} addToCart={addToCart} />} />
                    <Route path="/search" element={<SearchResults products={products} />} />
                    <Route path="/checkout" element={<Checkout cart={cart} cartTotal={cartTotal} clearCart={clearCart} />} />
                    <Route path="/login" element={<Login setToken={setToken} />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/account" element={<Account setToken={setToken} setUser={setUser} />} />

                    {/* ADMIN */}
                    <Route path="/admin" element={<AdminRoute user={user}><AdminMenu /></AdminRoute>} />
                    <Route path="/admin/products" element={<AdminRoute user={user}><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/orders" element={<AdminRoute user={user}><OrderManager /></AdminRoute>} />

                    <Route path="/success" element={<Success />} />
                    <Route path="/access-denied" element={<AccessDenied />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;