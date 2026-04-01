import { db, auth } from './firebase-config.js';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { showToast, formatCurrency, formatDate } from '../utils/helpers.js';

export async function loadCarDetails(carId) {
    try {
        const carDoc = await getDoc(doc(db, 'cars', carId));
        if (!carDoc.exists()) return null;

        const car = carDoc.data();
        const sellerDoc = await getDoc(doc(db, 'users', car.sellerId));
        const seller = sellerDoc.data();

        return { car, seller };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function handleBuyNow(carId) {
    const user = auth.currentUser;
    if (!user) {
        showToast('Please login to buy this car', 'error');
        window.location.href = '/login.html';
        return;
    }

    try {
        const carDoc = await getDoc(doc(db, 'cars', carId));
        const car = carDoc.data();

        if (car.sellerId === user.uid) {
            showToast('You cannot buy your own car!', 'error');
            return;
        }

        const orderData = {
            buyerId: user.uid,
            sellerId: car.sellerId,
            carId: carId,
            price: car.price,
            paymentStatus: 'Paid',
            orderDate: serverTimestamp()
        };

        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        showToast('Purchase successful!', 'success');
        setTimeout(() => window.location.href = `/invoice.html?orderId=${orderRef.id}`, 2000);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

export async function handleSaveFavorite(carId) {
    const user = auth.currentUser;
    if (!user) {
        showToast('Please login to save favorites', 'error');
        return;
    }

    try {
        await addDoc(collection(db, 'favorites'), {
            userId: user.uid,
            carId: carId,
            createdAt: serverTimestamp()
        });
        showToast('Added to favorites!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}
