import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Send, Edit2, X, Check, Trash2, Sparkles } from 'lucide-react';
import StreakWidget from '../components/StreakWidget';
import MoodTracker from '../components/MoodTracker';
import { FadeIn, StaggerContainer, StaggerItem, TiltCard, HoverScale } from '../components/Animations';
import Avatar from '../components/Avatar';
import { useContent } from '../contexts/ContentContext';
import { useUser } from '../contexts/UserContext';
import { useGamification } from '../contexts/GamificationContext';
import './Home.css';

export default function Home() {
    const { posts, addPost, toggleLike, updatePost, deletePost, loading } = useContent();
    const { user } = useUser();
    const { addXp } = useGamification();
    const [newPostContent, setNewPostContent] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Editing State
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const handlePost = async () => {
        if (!newPostContent.trim()) return;

        const post = {
            id: Date.now(),
            user: user.name,
            avatar: user.avatar,
            content: newPostContent,
        };

        await addPost(post);
        setNewPostContent("");
        addXp(20, "Shared Post");
    };

    const handleStartEdit = (post) => {
        setEditingId(post.id);
        setEditContent(post.content);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        await updatePost(editingId, editContent);
        setEditingId(null);
        setEditContent("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const handleDelete = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            await deletePost(postId);
            if (editingId === postId) {
                handleCancelEdit();
            }
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return "Just now";
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <motion.div
                className="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <p>Loading your feed...</p>
            </motion.div>
        );
    }

    return (
        <div className="home-page">
            <FadeIn direction="down">
                <header className="page-header">
                    <div className="header-content">
                        <h2 className="page-title">
                            <span className="text-gradient-aurora">Home</span>
                        </h2>
                        <p className="page-subtitle">Share your journey, inspire others</p>
                    </div>
                    <div className="tabs">
                        <motion.button
                            className="tab active"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>For You</span>
                            <div className="tab-indicator"></div>
                        </motion.button>
                        <motion.button
                            className="tab"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Following</span>
                        </motion.button>
                    </div>
                </header>
            </FadeIn>

            <StaggerContainer className="widgets-row">
                <StaggerItem>
                    <MoodTracker />
                </StaggerItem>
                <StaggerItem>
                    <StreakWidget />
                </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.2}>
                <TiltCard>
                    <motion.div
                        className={`create-post card-3d ${isFocused ? 'focused' : ''}`}
                        animate={isFocused ? {
                            boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
                            borderColor: 'var(--primary)'
                        } : {}}
                    >
                        <div className="create-post-header">
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut"
                                }}
                            >
                                <Sparkles size={18} className="text-gradient" />
                            </motion.div>
                            <span>Share something inspiring</span>
                        </div>
                        <div className="input-area">
                            <div className="avatar-glow">
                                <div className="avatar-glow">
                                    <Avatar src={user.avatar} alt={user.name} size="md" />
                                </div>
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="What's on your mind?"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePost()}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                                <div className="input-glow"></div>
                            </div>
                        </div>
                        <div className="post-actions">
                            <HoverScale scale={1.1}>
                                <button className="action-btn">
                                    <Image size={20} />
                                    <span>Media</span>
                                </button>
                            </HoverScale>
                            <motion.button
                                className="btn-glow post-btn"
                                onClick={handlePost}
                                disabled={!newPostContent.trim()}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Post</span>
                                <Send size={16} />
                            </motion.button>
                        </div>
                    </motion.div>
                </TiltCard>
            </FadeIn>

            <StaggerContainer className="feed">
                <AnimatePresence mode="popLayout">
                    {posts.map((post, index) => (
                        <StaggerItem key={post.id}>
                            <motion.article
                                className="post card-3d scroll-reveal"
                                layout
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                whileHover={{
                                    y: -4,
                                    boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)'
                                }}
                            >
                                <div className="post-header">
                                    <motion.div
                                        className="avatar-glow small"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <Avatar src={post.avatar} alt={post.user} size="md" />
                                    </motion.div>
                                    <div className="post-meta">
                                        <h4 className="post-author">
                                            {post.user}
                                            {post.isEdited && <span className="edited-tag">edited</span>}
                                        </h4>
                                        <span className="timestamp">{formatTime(post.time)}</span>
                                    </div>

                                    {editingId === post.id ? (
                                        <div className="edit-actions">
                                            <motion.button
                                                onClick={handleSaveEdit}
                                                className="icon-btn success"
                                                title="Save"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Check size={18} />
                                            </motion.button>
                                            <motion.button
                                                onClick={handleCancelEdit}
                                                className="icon-btn danger"
                                                title="Cancel"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X size={18} />
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className="post-controls">
                                            <motion.button
                                                onClick={() => handleStartEdit(post)}
                                                className="icon-btn"
                                                title="Edit Post"
                                                whileHover={{ scale: 1.2, rotate: 15 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Edit2 size={16} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleDelete(post.id)}
                                                className="icon-btn danger-hover"
                                                title="Delete Post"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {editingId === post.id ? (
                                        <motion.div
                                            className="edit-area"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                autoFocus
                                                className="edit-textarea"
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.p
                                            className="post-content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {post.content}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <div className="post-footer">
                                    <motion.button
                                        className={`footer-btn ${post.isLiked ? 'liked' : ''}`}
                                        onClick={() => toggleLike(post.id, post.likes || 0, post.isLiked)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <motion.span
                                            className="btn-icon"
                                            animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
                                        >
                                            ❤️
                                        </motion.span>
                                        <span>{post.likes || 0}</span>
                                    </motion.button>
                                    <motion.button
                                        className="footer-btn"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <span className="btn-icon">💬</span>
                                        <span>Comment</span>
                                    </motion.button>
                                    <motion.button
                                        className="footer-btn"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <span className="btn-icon">↗️</span>
                                        <span>Share</span>
                                    </motion.button>
                                </div>
                            </motion.article>
                        </StaggerItem>
                    ))}
                </AnimatePresence>
            </StaggerContainer>
        </div>
    );
}
