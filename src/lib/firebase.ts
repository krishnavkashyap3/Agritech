import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || "AIzaSyCgbqKQm7MBvhah9O7WNIQHlvQC0QJcrU0",
  authDomain: firebaseConfigJson.authDomain || "agritech-4d623.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || "agritech-4d623",
  storageBucket: firebaseConfigJson.storageBucket || "agritech-4d623.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "1015784278623",
  appId: firebaseConfigJson.appId || "1:1015784278623:web:9f4836a712c52060fe69ea",
};

// Initialize Firebase singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
