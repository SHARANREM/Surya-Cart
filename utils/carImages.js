export function getCarImage(brand) {
    if (!brand) return "/assets/car-images/default.jpg";
    
    const formatted = brand.toLowerCase().trim();

    const images = {
        toyota: "/assets/car-images/toyota.jpg",
        honda: "/assets/car-images/honda.jpg",
        bmw: "/assets/car-images/bmw.jpg",
        audi: "/assets/car-images/audi.jpg",
        hyundai: "/assets/car-images/hyundai.jpg",
        tata: "/assets/car-images/tata.jpg",
        mahindra: "/assets/car-images/mahindra.jpg",
        kia: "/assets/car-images/kia.jpg",
        ford: "/assets/car-images/ford.jpg",
        nissan: "/assets/car-images/nissan.jpg"
    };

    return images[formatted] || "/assets/car-images/default.jpg";
}
