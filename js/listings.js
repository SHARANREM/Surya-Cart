import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { showToast } from '../utils/helpers.js';
import { createCarCard } from './marketplace.js';

export async function loadMyListings(userId) {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    try {
        const q = query(
            collection(db, 'cars'), 
            where('sellerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        
        grid.innerHTML = '';
        if (snapshot.empty) {
            grid.innerHTML = '<div class="col-span-full py-24 text-center"><p class="text-gray-500 text-xl">You haven\'t listed any cars yet.</p><a href="/add-car.html" class="text-blue-600 font-bold mt-4 inline-block">Start Selling Now &rarr;</a></div>';
            return;
        }

        snapshot.forEach(docSnap => {
            const car = docSnap.data();
            const card = createCarCard(docSnap.id, car);
            
            const statusColor = car.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              car.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700';
            
            const managementDiv = document.createElement('div');
            managementDiv.className = 'p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center';
            managementDiv.innerHTML = `
                <span class="px-2 py-1 rounded text-xs font-bold uppercase ${statusColor}">${car.status}</span>
                <div class="flex space-x-2">
                    <button class="text-red-600 hover:text-red-800 text-sm font-bold delete-btn" data-id="${docSnap.id}">Delete</button>
                </div>
            `;
            card.appendChild(managementDiv);
            grid.appendChild(card);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this listing?')) {
                    const id = e.target.dataset.id;
                    try {
                        await deleteDoc(doc(db, 'cars', id));
                        showToast('Listing deleted successfully', 'success');
                        loadMyListings(userId);
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error loading listings:", error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading listings.</p>';
    }
}
