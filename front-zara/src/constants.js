export const API_URL = "http://127.0.0.1:8001";

export const CATEGORIES = [
    "NEW ARRIVALS", "ALL", "HOODIES", "T-SHIRTS", "SHORTS",
    "SWEATPANTS", "TOPS", "BOTTOMS", "OUTERWEAR", "SHOES",
    "KNITWEAR", "DENIM", "UNDERWEAR", "ACCESSORIES"
];

export const AVAILABLE_SIZES = ['ONESIZE', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];


export const getImg = (category) => {
    // Obs³uga tablicy kategorii (bierze pierwsz¹ z brzegu)
    const cat = Array.isArray(category) ? category[0] : category;

    // U¿ywamy profesjonalnego serwisu do placeholderów, który siê nie wywala
    const baseUrl = "https://placehold.co/600x800/000000/FFFFFF?text=";

    switch (cat?.toUpperCase()) {
        case 'HOODIES': return `${baseUrl}HOODIE`;
        case 'DENIM': return `${baseUrl}DENIM`;
        case 'UNDERWEAR': return `${baseUrl}UNDERWEAR`;
        case 'ACCESSORIES': return `${baseUrl}ACCESSORIES`;
        case 'SHOES': return `${baseUrl}SHOES`;
        case 'T-SHIRTS': return `${baseUrl}T-SHIRT`;
        default: return `${baseUrl}STUDIO+PRODUCT`;
    }
};