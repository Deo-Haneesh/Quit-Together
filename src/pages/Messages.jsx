
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Search, Send, ArrowLeft, User,
    Circle, MoreVertical, ShieldAlert
} from 'lucide-react';
import { useMessages } from '../contexts/MessagesContext';
import { useTranslation } from 'react-i18next';
import './Messages.css';

// Conversation list item
function ConversationItem({ conversation, isActive, onClick }) {
    const { getOtherParticipant, currentUserId } = useMessages();
    const other = getOtherParticipant(conversation);
    const unread = conversation.unreadCount?.[currentUserId] || 0;

    return (
        <motion.div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
            whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="conv-avatar">
                {other.name.charAt(0).toUpperCase()}
            </div>
            <div className="conv-info">
                <h4>{other.name}</h4>
                <p className="last-message">{conversation.lastMessage || "No messages yet"}</p>
            </div>
            {unread > 0 && (
                <motion.span
                    className="unread-badge notif-pulse"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    {unread}
                </motion.span>
            )}
        </motion.div>
    );
}

// Chat room component
function ChatRoom({ conversation, onBack }) {
    const { messages, sendMessage, getOtherParticipant, currentUserId } = useMessages();
    const [input, setInput] = useState('');
    const other = getOtherParticipant(conversation);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-room glass-panel">
            <header className="chat-header">
                <motion.button
                    className="back-btn"
                    onClick={onBack}
                    whileHover={{ x: -3, color: '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div className="chat-user-info">
                    <div className="chat-avatar">{other.name.charAt(0)}</div>
                    <div>
                        <h3>{other.name}</h3>
                        <span className="status">
                            <Circle size={8} className="online" />
                            Active Node
                        </span>
                    </div>
                </div>
                <button className="more-btn">
                    <MoreVertical size={20} />
                </button>
            </header>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <MessageCircle size={48} />
                        <p className="font-typewriter">INITIATE ENCRYPTED LINK WITH {other.name.toUpperCase()}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="message-bubble">
                                <p>{msg.content}</p>
                                <span className="message-time">{formatTime(msg.createdAt)}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <form className="message-input-form" onSubmit={handleSend}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Transmit data..."
                    className="message-input font-typewriter"
                />
                <motion.button
                    type="submit"
                    className="send-btn"
                    disabled={!input.trim()}
                    whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Send size={20} />
                </motion.button>
            </form>
        </div>
    );
}

export default function Messages() {
    const { t } = useTranslation();
    const {
        conversations,
        activeConversation,
        setActiveConversation,
        loading,
        unreadTotal
    } = useMessages();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(c => {
        if (!searchQuery) return true;
        const names = Object.values(c.participantNames || {});
        return names.some(name =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <motion.div
            className="messages-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <AnimatePresence mode="wait">
                {activeConversation ? (
                    <motion.div
                        key="chat"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                        className="chat-view"
                    >
                        <ChatRoom
                            conversation={activeConversation}
                            onBack={() => setActiveConversation(null)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="conversations-view"
                    >
                        <header className="messages-header">
                            <div className="header-title">
                                <MessageCircle size={28} className="header-icon text-glitch" />
                                <div>
                                    <h2 className="font-bebas tracking-wide text-glitch" data-text="SECURE COMMS">SECURE COMMS</h2>
                                    {unreadTotal > 0 && (
                                        <span className="unread-total">{unreadTotal} ENCRYPTED PACKETS</span>
                                    )}
                                </div>
                            </div>
                        </header>

                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="SEARCH NETWORK..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input font-typewriter"
                            />
                        </div>

                        <div className="conversations-list">
                            {loading ? (
                                <div className="loading-state">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="skeleton-conversation">
                                            <div className="skeleton skeleton-avatar" />
                                            <div className="skeleton-content">
                                                <div className="skeleton skeleton-line" />
                                                <div className="skeleton skeleton-line short" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="empty-state">
                                    <ShieldAlert size={48} className="mb-4 opacity-50 text-red-500" />
                                    <h3 className="font-bebas text-xl">NO ACTIVE NODES</h3>
                                    <p className="text-muted font-typewriter text-sm">Initiate protocol via Profile access.</p>
                                </div>
                            ) : (
                                filteredConversations.map(conv => (
                                    <ConversationItem
                                        key={conv.id}
                                        conversation={conv}
                                        isActive={activeConversation?.id === conv.id}
                                        onClick={() => setActiveConversation(conv)}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
