'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    orderBy,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';

const MessagesContext = createContext();

// Demo user ID (replace with auth)
const CURRENT_USER_ID = "demo_user";

export function MessagesProvider({ children }) {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Load conversations
    useEffect(() => {
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", CURRENT_USER_ID),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(convos);

            // Calculate total unread
            const unread = convos.reduce((sum, c) => {
                return sum + (c.unreadCount?.[CURRENT_USER_ID] || 0);
            }, 0);
            setUnreadTotal(unread);

            setLoading(false);
        }, (error) => {
            console.error("Error loading conversations:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load messages for active conversation
    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, "messages"),
            where("conversationId", "==", activeConversation.id),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        // Mark as read when opening
        markAsRead(activeConversation.id);

        return () => unsubscribe();
    }, [activeConversation]);

    // Start or get existing conversation
    const startConversation = useCallback(async (userId, userName) => {
        try {
            // Check for existing conversation
            const participants = [CURRENT_USER_ID, userId].sort();

            const q = query(
                collection(db, "conversations"),
                where("participants", "==", participants)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Return existing conversation
                const existing = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                setActiveConversation(existing);
                return existing;
            }

            // Create new conversation
            const newConvo = {
                participants,
                participantNames: {
                    [CURRENT_USER_ID]: "You",
                    [userId]: userName || "User"
                },
                lastMessage: "",
                lastMessageAt: serverTimestamp(),
                unreadCount: {
                    [CURRENT_USER_ID]: 0,
                    [userId]: 0
                },
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "conversations"), newConvo);
            const convo = { id: docRef.id, ...newConvo };
            setActiveConversation(convo);
            return convo;
        } catch (error) {
            console.error("Error starting conversation:", error);
            return null;
        }
    }, []);

    // Send message
    const sendMessage = useCallback(async (content) => {
        if (!activeConversation || !content.trim()) return;

        try {
            const otherUserId = activeConversation.participants.find(
                p => p !== CURRENT_USER_ID
            );

            // Add message
            await addDoc(collection(db, "messages"), {
                conversationId: activeConversation.id,
                senderId: CURRENT_USER_ID,
                content: content.trim(),
                createdAt: serverTimestamp(),
                read: false
            });

            // Update conversation
            const convoRef = doc(db, "conversations", activeConversation.id);
            await updateDoc(convoRef, {
                lastMessage: content.trim().substring(0, 50),
                lastMessageAt: serverTimestamp(),
                [`unreadCount.${otherUserId}`]: (activeConversation.unreadCount?.[otherUserId] || 0) + 1
            });

        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [activeConversation]);

    // Mark conversation as read
    const markAsRead = useCallback(async (conversationId) => {
        try {
            const convoRef = doc(db, "conversations", conversationId);
            await updateDoc(convoRef, {
                [`unreadCount.${CURRENT_USER_ID}`]: 0
            });
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    }, []);

    // Get other participant info
    const getOtherParticipant = useCallback((conversation) => {
        const otherId = conversation.participants.find(p => p !== CURRENT_USER_ID);
        return {
            id: otherId,
            name: conversation.participantNames?.[otherId] || "User"
        };
    }, []);

    const value = {
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        unreadTotal,
        loading,
        startConversation,
        sendMessage,
        markAsRead,
        getOtherParticipant,
        currentUserId: CURRENT_USER_ID
    };

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
}
