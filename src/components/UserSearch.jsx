import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, UserCheck, X, MessageCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { useSocial } from '../contexts/SocialContext';
import { useMessages } from '../contexts/MessagesContext';
import './UserSearch.css';

export default function UserSearch({ onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { followUser, unfollowUser, isFollowing, currentUserId } = useSocial();
    const { startConversation, setActiveConversation } = useMessages();
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!searchQuery.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Search by name (case-insensitive would require cloud functions)
                const q = query(
                    collection(db, "users"),
                    limit(10)
                );
                const snapshot = await getDocs(q);

                const filteredResults = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user =>
                        user.id !== currentUserId &&
                        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
                    );

                setResults(filteredResults);
                setShowResults(true);
            } catch (error) {
                console.error("Search error:", error);
            }
            setLoading(false);
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, currentUserId]);

    const handleFollow = async (user) => {
        if (isFollowing(user.id)) {
            await unfollowUser(user.id);
        } else {
            await followUser(user.id, user.name);
        }
    };

    const handleMessage = async (user) => {
        const convo = await startConversation(user.id, user.name);
        if (convo) {
            setActiveConversation(convo);
            onClose?.();
            // Navigate to messages page
            window.location.href = '/messages';
        }
    };

    return (
        <motion.div
            className="user-search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="user-search-modal glass-panel"
                initial={{ scale: 0.9, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="search-header">
                    <Search size={20} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <motion.button
                        className="close-btn"
                        onClick={onClose}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X size={20} />
                    </motion.button>
                </div>

                <div className="search-results">
                    {loading ? (
                        <div className="loading-indicator">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    ) : results.length === 0 && searchQuery ? (
                        <div className="no-results">
                            <p>No users found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {results.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    className="user-result"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="user-avatar">
                                        {user.avatar || user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <h4>{user.name}</h4>
                                        <span className="user-handle">{user.handle}</span>
                                    </div>
                                    <div className="user-actions">
                                        <motion.button
                                            className="message-btn"
                                            onClick={() => handleMessage(user)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Send message"
                                        >
                                            <MessageCircle size={18} />
                                        </motion.button>
                                        <motion.button
                                            className={`follow-btn ${isFollowing(user.id) ? 'following' : ''}`}
                                            onClick={() => handleFollow(user)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isFollowing(user.id) ? (
                                                <>
                                                    <UserCheck size={16} />
                                                    <span>Following</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={16} />
                                                    <span>Follow</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {!searchQuery && (
                        <div className="search-hint">
                            <Search size={32} />
                            <p>Search for users by name or handle</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
