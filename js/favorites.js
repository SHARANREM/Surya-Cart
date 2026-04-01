import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { showToast } from '../utils/helpers.js';
import { createCarCard } from './marketplace.js';

export async function loadFavorites(userId) {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    try {
        const q = query(collection(db, 'favorites'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        grid.innerHTML = '';
        if (snapshot.empty) {
            grid.innerHTML = '<div class="col-span-full py-24 text-center"><p class="text-gray-500 text-xl">You haven\'t saved any cars yet.</p><a href="/browse.html" class="text-blue-600 font-bold mt-4 inline-block">Browse Cars &rarr;</a></div>';
            return;
        }

        for (const favDoc of snapshot.docs) {
            const fav = favDoc.data();
            const carDoc = await getDoc(doc(db, 'cars', fav.carId));
            if (carDoc.exists()) {
                const card = createCarCard(carDoc.id, carDoc.data());
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'absolute top-2 left-2 bg-white/90 backdrop-blur p-2 rounded-full text-red-600 shadow-sm hover:bg-red-50 transition z-10';
                removeBtn.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>';
                removeBtn.onclick = async (e) => {
                    e.preventDefault();
                    await deleteDoc(doc(db, 'favorites', favDoc.id));
                    showToast('Removed from favorites', 'success');
                    loadFavorites(userId);
                };
                
                card.style.position = 'relative';
                card.appendChild(removeBtn);
                grid.appendChild(card);
            }
        }
    } catch (error) {
        console.error("Error loading favorites:", error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading favorites.</p>';
    }
}
