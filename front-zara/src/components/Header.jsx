import React from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { Search, User, ShoppingBag, ChevronDown } from 'lucide-react';

import { CATEGORIES } from '../constants';

import logo from '../assets/logo.png';



const Header = ({

    setIsSearchOpen,

    setIsCartOpen,

    cartCount,

    isShopMenuOpen,

    setIsShopMenuOpen,

    setSelectedCategory,

    user

}) => {

    const navigate = useNavigate();



    // Funkcja nawigacji do strony g³ównej z resetem stanów

    const goHome = () => {

        setIsShopMenuOpen(false);

        if (setSelectedCategory) {

            setSelectedCategory(null); // Opcjonalnie resetuje wybran¹ kategoriê

        }

        navigate('/');

        window.scrollTo(0, 0); // Przewija na sam¹ górê po powrocie

    };



    const handleNavigation = (category) => {

        setIsShopMenuOpen(false);

        if (category === "ALL") {

            navigate('/search?q=');

        } else {

            navigate(`/search?q=${category.toLowerCase()}`);

        }



        if (setSelectedCategory) {

            setSelectedCategory(category);

        }

    };



    return (

        <header className="bg-white border-b border-black fixed w-full h-20 top-0 z-[150]">

            <div className="max-w-[1920px] mx-auto h-full flex justify-between items-center text-black">



                {/* LEWA STRONA: LOGO KRYSZTAL - teraz u¿ywa goHome */}

                <div className="flex-1 flex justify-start pl-10">

                    <button onClick={goHome} className="bg-transparent border-none p-0 cursor-pointer block w-fit">

                        <img

                            src={logo}

                            alt="KRYSZTAL LOGO"

                            className="h-[22px] w-auto object-contain hover:opacity-70 transition-opacity"

                        />

                    </button>

                </div>



                {/* ŒRODEK: NAWIGACJA */}

                <nav className="hidden lg:flex items-center justify-center gap-10 text-[12px] uppercase tracking-[0.3em] font-medium h-full flex-[2]">

                    <button

                        onClick={goHome}

                        className="relative group bg-transparent border-none text-black cursor-pointer h-full flex items-center font-medium uppercase tracking-[0.3em]"

                    >

                        HOME

                        <span className="absolute bottom-5 left-0 w-full h-[1px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    </button>



                    {/* SHOP Z MEGA MENU */}

                    <div

                        className="relative h-full flex items-center"

                        onMouseEnter={() => setIsShopMenuOpen(true)}

                        onMouseLeave={() => setIsShopMenuOpen(false)}

                    >

                        <button

                            onClick={() => handleNavigation("ALL")}

                            className="bg-transparent border-none text-black uppercase tracking-[0.3em] py-4 cursor-pointer font-medium flex items-center gap-1"

                        >

                            SHOP <ChevronDown size={14} className={`transition-transform duration-300 ${isShopMenuOpen ? 'rotate-180' : ''}`} />

                        </button>

                        <span className={`absolute bottom-5 left-0 w-full h-[1px] bg-black transition-transform duration-300 origin-left ${isShopMenuOpen ? 'scale-x-100' : 'scale-x-0'}`} />



                        <div

                            className={`absolute top-full left-0 bg-white transition-all duration-300 overflow-hidden border border-black border-t-0 shadow-sm ${isShopMenuOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}

                            style={{ minWidth: '220px', width: 'fit-content', marginTop: '-1px' }}

                        >

                            <div className="px-10 py-10 flex flex-col gap-4 text-black bg-white">

                                {CATEGORIES.map(cat => (

                                    <button

                                        key={cat}

                                        className="text-[12px] text-left uppercase tracking-[0.2em] font-medium hover:pl-2 transition-all duration-300 w-full bg-transparent border-none p-0 cursor-pointer"

                                        onClick={() => handleNavigation(cat)}

                                    >

                                        {cat}

                                    </button>

                                ))}

                            </div>

                        </div>

                    </div>



                    <Link to="/search?q=blanc" className="relative group text-black no-underline h-full flex items-center font-medium">

                        BLANC BY KRYSZTAL

                        <span className="absolute bottom-5 left-0 w-full h-[1px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    </Link>



                    <a

                        href="https://maps.app.goo.gl/AFiLbX2h1rYfrTDTA"

                        target="_blank"

                        rel="noopener noreferrer"

                        className="relative group text-black no-underline h-full flex items-center font-medium"

                    >

                        STORE

                        <span className="absolute bottom-5 left-0 w-full h-[1px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    </a>

                </nav>



                {/* PRAWA STRONA: IKONY */}

                <div className="flex-1 flex justify-end items-center gap-8 h-full pr-10">

                    {/* ... (reszta ikon bez zmian) */}

                    <div className="hidden sm:flex items-center gap-1 text-[10px] tracking-[0.2em] font-medium cursor-pointer hover:opacity-40 transition-opacity">

                        ENGLISH <ChevronDown size={10} />

                    </div>

                    <Search size={22} strokeWidth={1.5} className="cursor-pointer hover:opacity-40 transition-opacity" onClick={() => setIsSearchOpen(true)} />

                    <Link to={user ? "/account" : "/login"} className="text-black hover:opacity-40 transition-opacity flex items-center h-full">

                        <User size={22} strokeWidth={1.5} />

                    </Link>

                    <div className="relative cursor-pointer hover:opacity-40 transition-opacity flex items-center" onClick={() => setIsCartOpen(true)}>

                        <ShoppingBag size={22} strokeWidth={1.5} />

                        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold tracking-normal leading-none">

                            {cartCount}

                        </span>

                    </div>

                </div>

            </div>

        </header>

    );

};



export default Header;