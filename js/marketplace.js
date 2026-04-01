import { db, auth } from './firebase-config.js';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs, 
    addDoc, 
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { formatCurrency, formatDate, showToast } from '../utils/helpers.js';
import { getCarImage } from '../utils/carImages.js';

export async function loadRecentListings() {
    const grid = document.getElementById('recent-listings-grid');
    if (!grid) return;

    try {
        const q = query(
            collection(db, 'cars'), 
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'), 
            limit(8)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-12">No cars listed yet.</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const car = doc.data();
            grid.appendChild(createCarCard(doc.id, car));
        });
    } catch (error) {
        console.error("Error loading listings:", error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500 py-12">Failed to load listings.</p>';
    }
}

export function createCarCard(id, car) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group';
    div.innerHTML = `
        <div class="relative h-48 overflow-hidden">
            <img src="${getCarImage(car.brand)}" 
                 alt="${car.title}" 
                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 referrerPolicy="no-referrer">
            <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-blue-600 shadow-sm">
                ${car.year}
            </div>
            <div class="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                ${formatCurrency(car.price)}
            </div>
        </div>
        <div class="p-5">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-gray-900 truncate">${car.title}</h3>
            </div>
            <div class="flex items-center text-gray-500 text-sm mb-4 space-x-3">
                <span class="flex items-center"><i class="mr-1"></i> ${car.brand}</span>
                <span class="flex items-center"><i class="mr-1"></i> ${car.fuelType}</span>
                <span class="flex items-center"><i class="mr-1"></i> ${car.transmission}</span>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-gray-50">
                <span class="text-xs text-gray-400">${car.location}</span>
                <a href="/car-details.html?id=${id}" class="text-blue-600 text-sm font-bold hover:text-blue-700 transition">View Details &rarr;</a>
            </div>
        </div>
    `;
    return div;
}

// Initial load for home page
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    loadRecentListings();
}
