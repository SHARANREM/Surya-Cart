import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { showToast } from '../utils/helpers.js';

export async function handleAddCar(formData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('You must be logged in');

        const carData = {
            ...formData,
            sellerId: user.uid,
            status: 'pending',
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'cars'), carData);
        showToast('Car listed successfully! Waiting for admin approval.', 'success');
        setTimeout(() => window.location.href = '/my-listings.html', 2000);
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}
