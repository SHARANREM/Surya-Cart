import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { showToast, formatCurrency, formatDate } from '../utils/helpers.js';

export async function loadAdminTab(tab) {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="p-12 text-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>';

    try {
        if (tab === 'pending') {
            const q = query(collection(db, 'cars'), where('status', '==', 'pending'));
            const snapshot = await getDocs(q);
            renderPending(snapshot);
        } else if (tab === 'listings') {
            const snapshot = await getDocs(collection(db, 'cars'));
            renderListings(snapshot);
        } else if (tab === 'users') {
            const snapshot = await getDocs(collection(db, 'users'));
            renderUsers(snapshot);
        } else if (tab === 'orders') {
            const snapshot = await getDocs(collection(db, 'orders'));
            renderOrders(snapshot);
        }
    } catch (error) {
        console.error(error);
        content.innerHTML = '<p class="p-12 text-center text-red-500">Error loading data.</p>';
    }
}

function renderPending(snapshot) {
    const content = document.getElementById('admin-content');
    if (snapshot.empty) {
        content.innerHTML = '<div class="p-12 text-center text-gray-400">No pending approvals.</div>';
        return;
    }

    let html = '<table class="w-full text-left"><thead class="bg-gray-50 border-b border-gray-100"><tr class="text-xs font-bold text-gray-400 uppercase tracking-wider"><th class="px-6 py-4">Car</th><th class="px-6 py-4">Price</th><th class="px-6 py-4">Seller</th><th class="px-6 py-4">Actions</th></tr></thead><tbody class="divide-y divide-gray-100">';
    
    snapshot.forEach(docSnap => {
        const car = docSnap.data();
        html += `
            <tr>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                        <img src="${car.images?.[0]}" class="w-10 h-10 rounded object-cover">
                        <div>
                            <p class="font-bold text-gray-900">${car.title}</p>
                            <p class="text-xs text-gray-500">${car.brand} ${car.model}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 font-bold text-blue-600">${formatCurrency(car.price)}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${car.sellerId.substr(0, 8)}...</td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold approve-btn" data-id="${docSnap.id}">Approve</button>
                        <button class="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold reject-btn" data-id="${docSnap.id}">Reject</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    content.innerHTML = html;

    document.querySelectorAll('.approve-btn').forEach(btn => btn.onclick = () => updateCarStatus(btn.dataset.id, 'approved'));
    document.querySelectorAll('.reject-btn').forEach(btn => btn.onclick = () => updateCarStatus(btn.dataset.id, 'rejected'));
}

async function updateCarStatus(id, status) {
    try {
        await updateDoc(doc(db, 'cars', id), { status });
        showToast(`Listing ${status}`, 'success');
        loadAdminTab('pending');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderUsers(snapshot) {
    const content = document.getElementById('admin-content');
    let html = '<table class="w-full text-left"><thead class="bg-gray-50 border-b border-gray-100"><tr class="text-xs font-bold text-gray-400 uppercase tracking-wider"><th class="px-6 py-4">User</th><th class="px-6 py-4">Email</th><th class="px-6 py-4">Role</th><th class="px-6 py-4">Actions</th></tr></thead><tbody class="divide-y divide-gray-100">';
    
    snapshot.forEach(docSnap => {
        const user = docSnap.data();
        html += `
            <tr>
                <td class="px-6 py-4 font-bold text-gray-900">${user.name}</td>
                <td class="px-6 py-4 text-gray-500">${user.email}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}">${user.role}</span></td>
                <td class="px-6 py-4">
                    <button class="text-red-600 hover:underline text-xs font-bold">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    content.innerHTML = html;
}

function renderOrders(snapshot) {
    const content = document.getElementById('admin-content');
    let html = '<table class="w-full text-left"><thead class="bg-gray-50 border-b border-gray-100"><tr class="text-xs font-bold text-gray-400 uppercase tracking-wider"><th class="px-6 py-4">Order ID</th><th class="px-6 py-4">Amount</th><th class="px-6 py-4">Date</th></tr></thead><tbody class="divide-y divide-gray-100">';
    
    snapshot.forEach(docSnap => {
        const order = docSnap.data();
        html += `
            <tr>
                <td class="px-6 py-4 font-bold text-gray-900">#${docSnap.id.substr(0, 8)}</td>
                <td class="px-6 py-4 font-bold text-blue-600">${formatCurrency(order.price)}</td>
                <td class="px-6 py-4 text-gray-500">${formatDate(order.orderDate?.toDate())}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    content.innerHTML = html;
}
