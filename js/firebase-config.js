import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBU3MRgzjbvFjqUijXMeBIymqGVS8PZqYo",
  authDomain: "surya-carkart.firebaseapp.com",
  projectId: "surya-carkart",
  storageBucket: "surya-carkart.firebasestorage.app",
  messagingSenderId: "1093818087450",
  appId: "1:1093818087450:web:d11070fba3732db411f9a3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase Initialized");
