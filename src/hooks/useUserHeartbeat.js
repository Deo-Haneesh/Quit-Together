import { useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function useUserHeartbeat() {
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);

        // Update look immediately
        const updateHeartbeat = async () => {
            try {
                await updateDoc(userRef, {
                    lastSeen: serverTimestamp(),
                    isOnline: true
                });
            } catch (error) {
                console.error("Heartbeat error:", error);
            }
        };

        updateHeartbeat();

        // Then every 5 minutes
        const interval = setInterval(updateHeartbeat, 5 * 60 * 1000);

        // Handle window close/unload to attempt setting offline (best effort)
        const handleUnload = () => {
            // Navigator.sendBeacon could be used here for more meaningful "offline" logic
            // providing we had a cloud function endpoint, but for now we won't complicate it.
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [currentUser]);
}
