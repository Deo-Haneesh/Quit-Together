import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const UserContext = createContext();

const DEFAULT_USER = {
    name: "Anonymous",
    handle: "@user",
    avatar: "👤",
    bio: "Ready to fight.",
    location: "Unknown",
    interests: [],
    joinedDate: new Date().toISOString(),
    stats: {
        streakDays: 0,
        longestStreak: 0,
        lastCheckIn: null,
        totalCheckIns: 0,
        weeklyCheckIns: [],
        moodHistory: []
    }
};

export function UserProvider({ children }) {
    const { currentUser } = useAuth();
    const [user, setUser] = useState(DEFAULT_USER);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setUser(DEFAULT_USER);
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUser({ ...DEFAULT_USER, ...docSnap.data() });
            } else {
                // Initialize new user profile
                const emailPrefix = currentUser.email ? currentUser.email.split('@')[0] : 'user';
                const newUser = {
                    ...DEFAULT_USER,
                    name: currentUser.displayName || "New Fighter",
                    handle: `@${emailPrefix}`,
                    avatar: currentUser.photoURL || "👤",
                    email: currentUser.email
                };
                setDoc(userDocRef, newUser).catch(err => console.error("Error creating profile:", err));
                setUser(newUser);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user profile:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const updateProfile = async (updates) => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, "users", currentUser.uid), updates, { merge: true });
            // Local state updatd by snapshot listener
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const updateStats = async (updates) => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, "users", currentUser.uid), {
                stats: { ...user.stats, ...updates }
            }, { merge: true });
        } catch (error) {
            console.error("Error updating stats:", error);
        }
    };

    const checkIn = async () => {
        if (!currentUser) return false;

        const now = new Date();
        const today = now.toDateString();
        const lastCheckInDate = user.stats.lastCheckIn ? new Date(user.stats.lastCheckIn) : null;
        const last = lastCheckInDate ? lastCheckInDate.toDateString() : null;

        if (today === last) return false;

        let newStreak = 1;
        if (lastCheckInDate) {
            const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastMidnight = new Date(lastCheckInDate.getFullYear(), lastCheckInDate.getMonth(), lastCheckInDate.getDate());
            const daysDiff = Math.round((todayMidnight - lastMidnight) / 86400000);

            if (daysDiff === 1) newStreak = user.stats.streakDays + 1;
            else if (daysDiff === 0) newStreak = user.stats.streakDays;
        }

        const dayOfWeek = now.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        let newWeeklyCheckIns = [...(user.stats.weeklyCheckIns || [])];

        if (lastCheckInDate) {
            const daysSinceLastCheckIn = Math.round((now - lastCheckInDate) / 86400000);
            if (daysSinceLastCheckIn >= 7) {
                newWeeklyCheckIns = [];
            }
        }

        if (!newWeeklyCheckIns.includes(adjustedDay)) {
            newWeeklyCheckIns.push(adjustedDay);
        }

        const newStats = {
            ...user.stats,
            streakDays: newStreak,
            longestStreak: Math.max(user.stats.longestStreak || 0, newStreak),
            lastCheckIn: now.toISOString(),
            totalCheckIns: (user.stats.totalCheckIns || 0) + 1,
            weeklyCheckIns: newWeeklyCheckIns
        };

        await updateStats(newStats);
        return true;
    };

    return (
        <UserContext.Provider value={{ user, updateProfile, updateStats, checkIn, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

