import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDETjOAn2IM_MekXh0x-aVG66nZoZHRvtA",
    authDomain: "finalquit-3ca5c.firebaseapp.com",
    projectId: "finalquit-3ca5c",
    storageBucket: "finalquit-3ca5c.firebasestorage.app",
    messagingSenderId: "252386937902",
    appId: "1:252386937902:web:aced793addd90b1ed3a3bf",
    measurementId: "G-SBVT024SWP"
};

// Initialize Firebase (prevent re-initialization in Next.js hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics only works in browser
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, app, analytics, storage };
