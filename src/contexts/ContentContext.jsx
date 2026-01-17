import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ContentContext = createContext();

export function ContentProvider({ children }) {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    // REAL-TIME LISTENER: Fetch posts from Firestore
    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("time", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const livePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(livePosts);
            setLoading(false);
        }, (error) => console.error("Firestore Error:", error));
        return () => unsubscribe();
    }, []);

    // REAL-TIME LISTENER: Fetch stories from Firestore
    useEffect(() => {
        const q = query(collection(db, "stories"), orderBy("time", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStories(liveStories);
        });
        return () => unsubscribe();
    }, []);

    // REAL-TIME LISTENER: Fetch Journal Entries (User Specific)
    useEffect(() => {
        if (!currentUser) {
            setJournalEntries([]);
            return;
        }

        const q = query(collection(db, "users", currentUser.uid, "journal"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJournalEntries(entries);
        }, (error) => console.error("Journal Sync Error:", error));

        return () => unsubscribe();
    }, [currentUser]);

    const addPost = async (postData) => {
        try {
            const { id, ...data } = postData;
            await addDoc(collection(db, "posts"), {
                ...data,
                time: new Date().toISOString(),
                likes: 0,
                userId: currentUser?.uid || "anonymous"
            });
        } catch (error) {
            console.error("Error adding post:", error);
        }
    };

    const updatePost = async (postId, newContent) => {
        try {
            await updateDoc(doc(db, "posts", postId), { content: newContent, isEdited: true });
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    const deletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, "posts", postId));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const toggleLike = async (postId) => {
        try {
            await updateDoc(doc(db, "posts", postId), { likes: increment(1) });
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    const addStory = async (storyData) => {
        try {
            await addDoc(collection(db, "stories"), {
                ...storyData,
                time: new Date().toISOString(),
                likes: 0,
                userId: currentUser?.uid || "anonymous"
            });
        } catch (error) {
            console.error("Error adding story:", error);
        }
    };

    const deleteStory = async (storyId) => {
        try {
            await deleteDoc(doc(db, "stories", storyId));
        } catch (error) {
            console.error("Error deleting story:", error);
        }
    };

    const toggleStoryLike = async (storyId) => {
        try {
            await updateDoc(doc(db, "stories", storyId), { likes: increment(1) });
        } catch (error) {
            console.error("Error liking story:", error);
        }
    };

    const addJournalEntry = async (entry) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "users", currentUser.uid, "journal"), entry);
        } catch (error) {
            console.error("Error adding journal entry:", error);
        }
    };

    const deleteJournalEntry = async (id) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "journal", id));
        } catch (error) {
            console.error("Error deleting journal entry:", error);
        }
    };

    return (
        <ContentContext.Provider value={{
            posts,
            addPost,
            toggleLike,
            updatePost,
            deletePost,
            stories,
            addStory,
            deleteStory,
            toggleStoryLike,
            journalEntries,
            addJournalEntry,
            deleteJournalEntry,
            loading
        }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    return useContext(ContentContext);
}
