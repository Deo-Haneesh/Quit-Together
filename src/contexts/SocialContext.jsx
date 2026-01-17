import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    increment,
    onSnapshot,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';

const SocialContext = createContext();

// Demo user ID (replace with auth when implemented)
const CURRENT_USER_ID = "demo_user";

export function SocialProvider({ children }) {
    const [following, setFollowing] = useState(new Set());
    const [followers, setFollowers] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load current user's following list
    useEffect(() => {
        const q = query(
            collection(db, "follows"),
            where("followerId", "==", CURRENT_USER_ID)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const followingIds = new Set();
            const followingData = [];

            snapshot.docs.forEach(doc => {
                followingIds.add(doc.data().followingId);
                followingData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            setFollowing(followingIds);
            setFollowingList(followingData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load followers
    useEffect(() => {
        const q = query(
            collection(db, "follows"),
            where("followingId", "==", CURRENT_USER_ID)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const followerData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFollowers(followerData);
        });

        return () => unsubscribe();
    }, []);

    // Load suggested users (users not being followed)
    useEffect(() => {
        const loadSuggested = async () => {
            try {
                const usersQuery = query(
                    collection(db, "users"),
                    limit(10)
                );
                const snapshot = await getDocs(usersQuery);

                const users = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user =>
                        user.id !== CURRENT_USER_ID &&
                        !following.has(user.id)
                    );

                setSuggestedUsers(users);
            } catch (error) {
                console.error("Error loading suggested users:", error);
            }
        };

        if (!loading) {
            loadSuggested();
        }
    }, [following, loading]);

    // Follow a user
    const followUser = useCallback(async (userId, userName) => {
        if (following.has(userId)) return;

        try {
            // Add follow relationship
            await addDoc(collection(db, "follows"), {
                followerId: CURRENT_USER_ID,
                followingId: userId,
                followingName: userName || 'User',
                createdAt: serverTimestamp()
            });

            // Update follower count on target user
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                followers: increment(1)
            }).catch(() => { }); // Ignore if user doc doesn't have field

            // Update following count on current user
            const currentUserRef = doc(db, "users", CURRENT_USER_ID);
            await updateDoc(currentUserRef, {
                following: increment(1)
            }).catch(() => { });

        } catch (error) {
            console.error("Error following user:", error);
        }
    }, [following]);

    // Unfollow a user
    const unfollowUser = useCallback(async (userId) => {
        if (!following.has(userId)) return;

        try {
            // Find the follow document
            const q = query(
                collection(db, "follows"),
                where("followerId", "==", CURRENT_USER_ID),
                where("followingId", "==", userId)
            );
            const snapshot = await getDocs(q);

            // Delete the follow document
            for (const docSnap of snapshot.docs) {
                await deleteDoc(doc(db, "follows", docSnap.id));
            }

            // Update counts
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                followers: increment(-1)
            }).catch(() => { });

            const currentUserRef = doc(db, "users", CURRENT_USER_ID);
            await updateDoc(currentUserRef, {
                following: increment(-1)
            }).catch(() => { });

        } catch (error) {
            console.error("Error unfollowing user:", error);
        }
    }, [following]);

    // Check if following a user
    const isFollowing = useCallback((userId) => {
        return following.has(userId);
    }, [following]);

    // Get follower/following counts for a user
    const getCounts = useCallback(async (userId) => {
        try {
            const followersQuery = query(
                collection(db, "follows"),
                where("followingId", "==", userId)
            );
            const followingQuery = query(
                collection(db, "follows"),
                where("followerId", "==", userId)
            );

            const [followersSnap, followingSnap] = await Promise.all([
                getDocs(followersQuery),
                getDocs(followingQuery)
            ]);

            return {
                followers: followersSnap.size,
                following: followingSnap.size
            };
        } catch (error) {
            console.error("Error getting counts:", error);
            return { followers: 0, following: 0 };
        }
    }, []);

    const value = {
        following,
        followers,
        followingList,
        suggestedUsers,
        followUser,
        unfollowUser,
        isFollowing,
        getCounts,
        loading,
        currentUserId: CURRENT_USER_ID
    };

    return (
        <SocialContext.Provider value={value}>
            {children}
        </SocialContext.Provider>
    );
}

export function useSocial() {
    const context = useContext(SocialContext);
    if (!context) {
        throw new Error('useSocial must be used within a SocialProvider');
    }
    return context;
}
