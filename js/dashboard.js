import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { createCarCard } from './marketplace.js';

export async function loadDashboardData(userId) {
    try {
        // Load Stats
        const listingsQuery = query(collection(db, 'cars'), where('sellerId', '==', userId));
        const listingsSnap = await getDocs(listingsQuery);
        const listingsCount = listingsSnap.size;

        const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', userId));
        const favoritesSnap = await getDocs(favoritesQuery);
        const favoritesCount = favoritesSnap.size;

        // Update UI if elements exist
        if (document.getElementById('stat-listings')) document.getElementById('stat-listings').textContent = listingsCount;
        if (document.getElementById('stat-favorites')) document.getElementById('stat-favorites').textContent = favoritesCount;

        // Load Orders
        const ordersQuery = query(
            collection(db, 'orders'), 
            where('buyerId', '==', userId),
            orderBy('orderDate', 'desc'),
            limit(5)
        );
        const ordersSnap = await getDocs(ordersQuery);
        renderOrders(ordersSnap);

        // Load My Listings
        const myCarsQuery = query(
            collection(db, 'cars'), 
            where('sellerId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(2)
        );
        const myCarsSnap = await getDocs(myCarsQuery);
        renderMyRecentListings(myCarsSnap);

    } catch (error) {
        console.error("Dashboard load error:", error);
    }
}

function renderOrders(snapshot) {
    const list = document.getElementById('orders-list');
    if (!list) return;

    if (snapshot.empty) {
        list.innerHTML = '<div class="p-12 text-center text-gray-400">No transactions found.</div>';
        return;
    }

    let html = '<table class="w-full text-left"><thead class="bg-gray-50 border-b border-gray-100"><tr class="text-xs font-bold text-gray-400 uppercase tracking-wider"><th class="px-6 py-4">Order ID</th><th class="px-6 py-4">Date</th><th class="px-6 py-4">Amount</th><th class="px-6 py-4">Action</th></tr></thead><tbody class="divide-y divide-gray-100">';
    
    snapshot.forEach(doc => {
        const order = doc.data();
        html += `
            <tr>
                <td class="px-6 py-4 font-medium text-gray-900">#${doc.id.substr(0, 8)}</td>
                <td class="px-6 py-4 text-gray-500">${formatDate(order.orderDate?.toDate())}</td>
                <td class="px-6 py-4 font-bold text-blue-600">${formatCurrency(order.price)}</td>
                <td class="px-6 py-4"><a href="/invoice.html?orderId=${doc.id}" class="text-blue-600 hover:underline">Invoice</a></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    list.innerHTML = html;
}

function renderMyRecentListings(snapshot) {
    const grid = document.getElementById('my-listings-grid');
    if (!grid) return;

    if (snapshot.empty) {
        grid.innerHTML = '<p class="text-gray-500">You haven\'t listed any cars yet.</p>';
        return;
    }

    grid.innerHTML = '';
    snapshot.forEach(doc => {
        grid.appendChild(createCarCard(doc.id, doc.data()));
    });
}
