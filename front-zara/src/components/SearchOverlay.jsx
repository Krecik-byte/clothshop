import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchOverlay = ({ isOpen, onClose }) => {
    const [tempQuery, setTempQuery] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && tempQuery.trim()) {
            onClose(); // Zamknij nak³adkê
            navigate(`/search?q=${tempQuery}`); // PrzejdŸ na stronê wyników
            setTempQuery(""); // Wyczyœæ pole
        }
    };

    return (
        <div className={`fixed top-0 left-0 w-full bg-white z-[200] transition-transform duration-500 border-b border-black ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-[1800px] mx-auto px-10 h-20 flex items-center justify-between text-black relative">
                <div className="flex items-center gap-6 flex-1">
                    <Search size={22} strokeWidth={1} />
                    <input
                        type="text"
                        placeholder="SZUKAJ..."
                        className="bg-transparent border-none outline-none text-[13px] uppercase tracking-[0.3em] font-medium text-black w-full"
                        value={tempQuery}
                        onChange={(e) => setTempQuery(e.target.value)}
                        onKeyDown={handleSearchSubmit} // Obs³uga Enter
                        autoFocus={isOpen}
                    />
                </div>
                <X size={26} strokeWidth={1} className="cursor-pointer" onClick={onClose} />
            </div>
        </div>
    );
};

export default SearchOverlay;