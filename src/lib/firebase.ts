/**
 * Firebase client-side configuration.
 * Provides Firebase Auth (with Google Sign-In) and Firestore (real-time data).
 *
 * CLIENT-SIDE — safe to import from React components.
 */
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import {
    getFirestore as getFirestoreSDK,
    Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Get or initialize the Firebase app (singleton).
 */
export function initFirebase(): FirebaseApp {
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

/**
 * Get Firebase Auth instance.
 */
export function getFirebaseAuth(): Auth {
    const app = initFirebase();
    return getAuth(app);
}

/**
 * Get Firestore instance for real-time data.
 */
export function getFirestoreInstance(): Firestore {
    const app = initFirebase();
    return getFirestoreSDK(app);
}

/**
 * Google Auth provider for Google Sign-In.
 */
export function getGoogleProvider(): GoogleAuthProvider {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return provider;
}
