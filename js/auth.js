import { auth, db, googleProvider } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { showToast } from '../utils/helpers.js';

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    const authNav = document.getElementById('auth-nav');
    if (!authNav) return;

    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        authNav.innerHTML = `
            <div class="flex items-center space-x-4">
                <a href="/dashboard.html" class="text-gray-700 hover:text-blue-600 font-medium">Dashboard</a>
                <div class="relative group">
                    <button class="flex items-center space-x-2 focus:outline-none">
                        <img src="${userData?.profileImage || 'https://ui-avatars.com/api/?name=' + user.email}" class="w-8 h-8 rounded-full border" referrerPolicy="no-referrer">
                        <span class="hidden md:block text-sm font-medium text-gray-700">${userData?.name || user.email.split('@')[0]}</span>
                    </button>
                    <div class="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <a href="/my-listings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Listings</a>
                        <a href="/favorites.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Favorites</a>
                        <a href="/chat.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Messages</a>
                        ${userData?.role === 'admin' ? '<a href="/admin.html" class="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 font-bold">Admin Panel</a>' : ''}
                        <hr class="my-1">
                        <button id="logout-btn" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    } else {
        authNav.innerHTML = `
            <a href="/login.html" class="text-gray-500 hover:text-gray-700 text-sm font-medium">Login</a>
            <a href="/register.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Register</a>
        `;
    }
});

export async function handleRegister(name, email, password, role = 'buyer') {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            name,
            email,
            role,
            profileImage: '',
            createdAt: serverTimestamp()
        });

        showToast('Registration successful!', 'success');
        window.location.href = '/dashboard.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

export async function handleLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Login successful!', 'success');
        window.location.href = '/dashboard.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

export async function handleGoogleLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                userId: user.uid,
                name: user.displayName,
                email: user.email,
                role: 'buyer',
                profileImage: user.photoURL,
                createdAt: serverTimestamp()
            });
        }

        showToast('Login successful!', 'success');
        window.location.href = '/dashboard.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

export async function handleLogout() {
    try {
        await signOut(auth);
        showToast('Logged out successfully', 'success');
        window.location.href = '/';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

export async function handlePasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset email sent!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}
