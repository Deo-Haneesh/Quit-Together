import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    writeBatch,
    limit
} from 'firebase/firestore';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
    LIKE: 'like',
    COMMENT: 'comment',
    FOLLOW: 'follow',
    MENTION: 'mention',
    SYSTEM: 'system',
    ACHIEVEMENT: 'achievement',
    STREAK: 'streak'
};

// Temporary user ID until authentication is implemented
// User ID handled by AuthContext

export function NotificationProvider({ children }) {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Real-time listener for notifications
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date()
                }));

                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.read).length);
                setLoading(false);
            },
            (error) => {
                console.error("Notification listener error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    /**
     * Create a new notification
     */
    const createNotification = useCallback(async ({
        recipientId,
        type,
        title,
        message,
        data = {},
        senderId = null
    }) => {
        try {
            await addDoc(collection(db, "notifications"), {
                recipientId,
                senderId,
                type,
                title,
                message,
                data,
                read: false,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    }, []);

    /**
     * Mark a single notification as read
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const notifRef = doc(db, "notifications", notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }, []);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        try {
            const batch = writeBatch(db);
            const unreadNotifs = notifications.filter(n => !n.read);

            unreadNotifs.forEach(notif => {
                const notifRef = doc(db, "notifications", notif.id);
                batch.update(notifRef, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    }, [notifications]);

    /**
     * Send a like notification
     */
    const notifyLike = useCallback(async (postAuthorId, postId, likerName) => {
        if (postAuthorId === USER_ID) return; // Don't notify self

        await createNotification({
            recipientId: postAuthorId,
            type: NOTIFICATION_TYPES.LIKE,
            title: 'New Like',
            message: `${likerName} liked your post`,
            data: { postId },
            senderId: USER_ID
        });
    }, [createNotification]);

    /**
     * Send a comment notification
     */
    const notifyComment = useCallback(async (postAuthorId, postId, commenterName, commentPreview) => {
        if (postAuthorId === USER_ID) return;

        await createNotification({
            recipientId: postAuthorId,
            type: NOTIFICATION_TYPES.COMMENT,
            title: 'New Comment',
            message: `${commenterName}: ${commentPreview.substring(0, 50)}...`,
            data: { postId },
            senderId: USER_ID
        });
    }, [createNotification]);

    /**
     * Send a follow notification
     */
    const notifyFollow = useCallback(async (followedUserId, followerName) => {
        if (followedUserId === USER_ID) return;

        await createNotification({
            recipientId: followedUserId,
            type: NOTIFICATION_TYPES.FOLLOW,
            title: 'New Follower',
            message: `${followerName} started following you`,
            senderId: USER_ID
        });
    }, [createNotification]);

    /**
     * Send an achievement notification
     */
    const notifyAchievement = useCallback(async (badgeName, badgeIcon) => {
        await createNotification({
            recipientId: USER_ID,
            type: NOTIFICATION_TYPES.ACHIEVEMENT,
            title: 'Achievement Unlocked! 🏆',
            message: `You earned the "${badgeName}" badge!`,
            data: { badgeName, badgeIcon }
        });
    }, [createNotification]);

    /**
     * Send a streak notification
     */
    const notifyStreak = useCallback(async (streakDays) => {
        const milestones = [3, 7, 14, 30, 60, 100, 365];
        if (!milestones.includes(streakDays)) return;

        await createNotification({
            recipientId: USER_ID,
            type: NOTIFICATION_TYPES.STREAK,
            title: `${streakDays}-Day Streak! 🔥`,
            message: `Amazing! You've maintained your streak for ${streakDays} days!`,
            data: { streakDays }
        });
    }, [createNotification]);

    /**
     * Get notifications grouped by time
     */
    const getGroupedNotifications = useCallback(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        notifications.forEach(notif => {
            const notifDate = notif.createdAt;

            if (notifDate >= today) {
                groups.today.push(notif);
            } else if (notifDate >= yesterday) {
                groups.yesterday.push(notif);
            } else if (notifDate >= lastWeek) {
                groups.thisWeek.push(notif);
            } else {
                groups.older.push(notif);
            }
        });

        return groups;
    }, [notifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        createNotification,
        notifyLike,
        notifyComment,
        notifyFollow,
        notifyAchievement,
        notifyStreak,
        getGroupedNotifications,
        NOTIFICATION_TYPES
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

export default NotificationContext;
