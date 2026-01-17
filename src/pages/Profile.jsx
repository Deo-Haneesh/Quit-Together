import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, MessageCircle, Gamepad2, Edit2, Check, X, MapPin, Hash, Sparkles, Star } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useGamification } from '../contexts/GamificationContext';
import { useContent } from '../contexts/ContentContext';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, TiltCard, HoverLift } from '../components/Animations';
import './Profile.css';

export default function Profile() {
    const { user, updateProfile } = useUser();
    const { gameState, levels } = useGamification();
    const { posts } = useContent();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        bio: user.bio || "",
        location: user.location || "",
        interests: user.interests || []
    });
    const [newInterest, setNewInterest] = useState("");

    const userPostsCount = posts.filter(p => p.user === user.name).length;

    // XP specific to next level
    const currentLevelObj = levels.find(l => l.level === gameState.level);
    const nextLevelObj = levels.find(l => l.level === gameState.level + 1);
    const xpForCurrentLevel = currentLevelObj ? currentLevelObj.xp : 0;
    const xpForNextLevel = nextLevelObj ? nextLevelObj.xp : (gameState.xp + 1000);
    const levelProgress = gameState.xp - xpForCurrentLevel;
    const levelRange = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min(100, (levelProgress / levelRange) * 100);

    const badges = [
        { id: 1, icon: '🔥', name: 'First Day', desc: 'Started your journey', unlocked: true },
        { id: 2, icon: '📅', name: '3-Day Streak', desc: '3 consecutive days', unlocked: user.stats.streakDays >= 3 },
        { id: 3, icon: '🌟', name: '7-Day Warrior', desc: '1 week strong', unlocked: user.stats.streakDays >= 7 },
        { id: 4, icon: '💪', name: 'First Post', desc: 'Shared your story', unlocked: userPostsCount >= 1 },
        { id: 5, icon: '🫧', name: 'Bubble Master', desc: 'Popped 100 bubbles', unlocked: false },
        { id: 6, icon: '🧘', name: 'Zen Mode', desc: 'Reached Level 3', unlocked: gameState.level >= 3 },
        { id: 7, icon: '🏆', name: '30-Day Legend', desc: '1 month milestone', unlocked: user.stats.streakDays >= 30 },
        { id: 8, icon: '💎', name: 'Level 5', desc: 'Reached level 5', unlocked: gameState.level >= 5 },
    ];

    const handleSaveProfile = () => {
        updateProfile(editForm);
        setIsEditing(false);
    };

    const addInterest = (e) => {
        if (e.key === 'Enter' && newInterest.trim()) {
            if (!editForm.interests.includes(newInterest.trim())) {
                setEditForm(prev => ({
                    ...prev,
                    interests: [...prev.interests, newInterest.trim()]
                }));
            }
            setNewInterest("");
        }
    };

    const removeInterest = (tag) => {
        setEditForm(prev => ({
            ...prev,
            interests: prev.interests.filter(t => t !== tag)
        }));
    };

    return (
        <div className="profile-page">
            {/* Profile Hero Card */}
            <FadeIn>
                <FadeIn>
                    <div className="profile-hero card-3d">
                        <div className="hero-background">
                            <div className="hero-gradient"></div>
                            <div className="hero-pattern"></div>
                        </div>

                        <motion.button
                            className="edit-profile-btn btn-magnetic"
                            onClick={() => {
                                setEditForm({
                                    name: user.name,
                                    handle: user.handle,
                                    avatar: user.avatar,
                                    bio: user.bio || "",
                                    location: user.location || "",
                                    interests: user.interests || []
                                });
                                setIsEditing(!isEditing);
                            }}
                            whileHover={{ scale: 1.1, rotate: isEditing ? 90 : 0 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                        </motion.button>

                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    className="profile-edit-form"
                                    key="edit"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Edit form content */}
                                    <div className="form-row">
                                        <div className="form-group avatar-edit">
                                            <label className="label-sm">Avatar</label>
                                            <input
                                                value={editForm.avatar}
                                                maxLength={2}
                                                onChange={e => setEditForm({ ...editForm, avatar: e.target.value.toUpperCase() })}
                                                className="avatar-input"
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label className="label-sm">Display Name</label>
                                            <input
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="Display Name"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label className="label-sm">Handle</label>
                                            <input
                                                value={editForm.handle}
                                                onChange={e => setEditForm({ ...editForm, handle: e.target.value })}
                                                placeholder="@handle"
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label className="label-sm">Location</label>
                                            <input
                                                value={editForm.location}
                                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="label-sm">Bio</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                            placeholder="Tell us about your journey..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label-sm">Interests (Press Enter to add)</label>
                                        <div className="tags-input-container">
                                            <AnimatePresence>
                                                {editForm.interests.map(tag => (
                                                    <motion.span
                                                        key={tag}
                                                        className="tag-chip editing"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        layout
                                                    >
                                                        {tag}
                                                        <button onClick={() => removeInterest(tag)}><X size={12} /></button>
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                            <input
                                                value={newInterest}
                                                onChange={e => setNewInterest(e.target.value)}
                                                onKeyPress={addInterest}
                                                placeholder="Add interest..."
                                                className="tag-input-field"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        className="save-profile-btn btn-glow"
                                        onClick={handleSaveProfile}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Check size={18} />
                                        <span>Save Changes</span>
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="profile-view"
                                    key="view"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <motion.div
                                        className="profile-avatar-container"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                    >
                                        <motion.div
                                            className="avatar-ring pulse-glow"
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                        />
                                        <div className="profile-avatar-large">{user.avatar}</div>
                                        <motion.div
                                            className="level-badge-profile"
                                            whileHover={{ scale: 1.2 }}
                                        >
                                            <Star size={10} />
                                            <span>{gameState.level}</span>
                                        </motion.div>
                                    </motion.div>

                                    <h2 className="profile-name">{user.name}</h2>
                                    <span className="profile-handle">{user.handle}</span>
                                    <div className="profile-title text-gradient-aurora">{gameState.title}</div>

                                    {user.bio && <p className="profile-bio">{user.bio}</p>}

                                    <div className="profile-meta">
                                        {user.location && (
                                            <span className="meta-item">
                                                <MapPin size={16} />
                                                {user.location}
                                            </span>
                                        )}
                                    </div>

                                    {user.interests && user.interests.length > 0 && (
                                        <div className="profile-tags">
                                            {user.interests.map((tag, i) => (
                                                <motion.span
                                                    key={tag}
                                                    className="tag-chip"
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                >
                                                    <Hash size={12} />
                                                    {tag}
                                                </motion.span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="xp-container">
                                        <div className="xp-info">
                                            <span className="xp-level">Level {gameState.level}</span>
                                            <span className="xp-progress">{gameState.xp} / {xpForNextLevel} XP</span>
                                        </div>
                                        <div className="xp-bar">
                                            <motion.div
                                                className="xp-fill shimmer"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </FadeIn>
            </FadeIn>

            {/* Stats Grid */}
            <StaggerContainer className="stats-grid">
                <StaggerItem>
                    <HoverLift>
                        <div className="stat-card card-3d scroll-reveal">
                            <motion.div
                                className="stat-icon posts"
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            >
                                <MessageCircle size={28} />
                            </motion.div>
                            <motion.div
                                className="stat-value"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {userPostsCount}
                            </motion.div>
                            <div className="stat-label">Posts Shared</div>
                        </div>
                    </HoverLift>
                </StaggerItem>

                <StaggerItem>
                    <HoverLift>
                        <div className="stat-card card-3d scroll-reveal">
                            <motion.div
                                className="stat-icon streak"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Flame size={28} />
                            </motion.div>
                            <div className="stat-value">{user.stats.streakDays}</div>
                            <div className="stat-label">Day Streak</div>
                        </div>
                    </HoverLift>
                </StaggerItem>

                <StaggerItem>
                    <HoverLift>
                        <div className="stat-card card-3d scroll-reveal">
                            <motion.div
                                className="stat-icon checkins"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Gamepad2 size={28} />
                            </motion.div>
                            <div className="stat-value">{user.stats.totalCheckIns}</div>
                            <div className="stat-label">Check-ins</div>
                        </div>
                    </HoverLift>
                </StaggerItem>

                <StaggerItem>
                    <HoverLift>
                        <div className="stat-card card-3d scroll-reveal">
                            <motion.div
                                className="stat-icon badges"
                                whileHover={{ y: -5 }}
                            >
                                <Trophy size={28} />
                            </motion.div>
                            <div className="stat-value">{badges.filter(b => b.unlocked).length}</div>
                            <div className="stat-label">Badges</div>
                        </div>
                    </HoverLift>
                </StaggerItem>
            </StaggerContainer>

            {/* Badges Section */}
            <ScaleIn>
                <div className="badges-section card-3d scroll-reveal">
                    <div className="section-header">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                        >
                            <Sparkles size={20} className="text-gradient" />
                        </motion.div>
                        <h3>Achievement Badges</h3>
                    </div>
                    <div className="badges-grid">
                        {badges.map((badge, index) => (
                            <motion.div
                                key={badge.id}
                                className={`badge ${badge.unlocked ? 'unlocked' : 'locked'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={badge.unlocked ? {
                                    scale: 1.05,
                                    y: -5,
                                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                                } : {}}
                            >
                                <motion.div
                                    className="badge-icon"
                                    animate={badge.unlocked ? { rotate: [0, 5, -5, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 }}
                                >
                                    {badge.icon}
                                </motion.div>
                                <div className="badge-name">{badge.name}</div>
                                <div className="badge-desc">{badge.desc}</div>
                                {!badge.unlocked && <div className="lock-overlay">🔒</div>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ScaleIn>
        </div>
    );
}
