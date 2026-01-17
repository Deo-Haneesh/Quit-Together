import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, Plus, Sparkles, Shield, Heart, Zap, X, Brain, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import './Groups.css';

// User ID handled by AuthContext

// Default groups to seed Firestore if empty
const SEED_GROUPS = [
    {
        name: "30-Day Sober Challenge",
        description: "Take the pledge. One month, one step at a time.",
        members: 1247,
        category: "addiction",
        color: "#ef4444",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "system"
    },
    {
        name: "Anxiety Warriors",
        description: "A safe space to share and overcome anxiety together.",
        members: 892,
        category: "anxiety",
        color: "#3b82f6",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "system"
    },
    {
        name: "Mindful Mornings",
        description: "Start each day with intention and gratitude.",
        members: 534,
        category: "wellness",
        color: "#10b981",
        isActive: false,
        createdAt: new Date().toISOString(),
        createdBy: "system"
    },
    {
        name: "Stress Busters",
        description: "Daily techniques and support for managing stress.",
        members: 678,
        category: "stress",
        color: "#f59e0b",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "system"
    },
];

const CATEGORY_OPTIONS = [
    { value: 'addiction', label: 'Addiction Recovery', icon: <Shield size={20} />, color: '#ef4444' },
    { value: 'anxiety', label: 'Anxiety Support', icon: <Heart size={20} />, color: '#3b82f6' },
    { value: 'depression', label: 'Depression Support', icon: <Brain size={20} />, color: '#8b5cf6' },
    { value: 'wellness', label: 'General Wellness', icon: <Sparkles size={20} />, color: '#10b981' },
    { value: 'stress', label: 'Stress Management', icon: <Zap size={20} />, color: '#f59e0b' },
    { value: 'mindfulness', label: 'Mindfulness', icon: <Leaf size={20} />, color: '#06b6d4' },
];

// Helper to get icon by category
const getCategoryIcon = (category) => {
    const cat = CATEGORY_OPTIONS.find(c => c.value === category);
    return cat?.icon || <Sparkles size={24} />;
};

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        category: 'wellness'
    });

    const { currentUser } = useAuth();
    const USER_ID = currentUser?.uid;

    // Real-time listener for groups from Firestore
    useEffect(() => {
        const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // If no groups exist, seed the database
            if (snapshot.empty) {
                console.log("Seeding groups collection...");
                for (const group of SEED_GROUPS) {
                    await addDoc(collection(db, "groups"), group);
                }
                return; // The listener will pick up the newly added groups
            }

            const liveGroups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                icon: getCategoryIcon(doc.data().category)
            }));
            setGroups(liveGroups);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Groups Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load user's joined groups from Firestore
    useEffect(() => {
        if (!USER_ID) return;
        const userDocRef = doc(db, "userGroups", USER_ID);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setJoinedGroups(docSnap.data().groups || []);
            } else {
                // Migrate from localStorage if available
                const saved = localStorage.getItem('qt_joined_groups');
                if (saved) {
                    const localJoined = JSON.parse(saved);
                    import('firebase/firestore').then(({ setDoc }) => {
                        setDoc(userDocRef, { groups: localJoined });
                    });
                    setJoinedGroups(localJoined);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const toggleJoin = async (groupId) => {
        const isCurrentlyJoined = joinedGroups.includes(groupId);
        const groupRef = doc(db, "groups", groupId);
        const userGroupsRef = doc(db, "userGroups", USER_ID);

        try {
            // Update member count
            await updateDoc(groupRef, {
                members: increment(isCurrentlyJoined ? -1 : 1)
            });

            // Update user's joined groups
            const newJoinedGroups = isCurrentlyJoined
                ? joinedGroups.filter(id => id !== groupId)
                : [...joinedGroups, groupId];

            const { setDoc } = await import('firebase/firestore');
            await setDoc(userGroupsRef, { groups: newJoinedGroups }, { merge: true });

            // Also update localStorage as backup
            localStorage.setItem('qt_joined_groups', JSON.stringify(newJoinedGroups));
        } catch (error) {
            console.error("Error toggling group membership:", error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroup.name.trim() || !newGroup.description.trim()) return;

        const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === newGroup.category);

        try {
            const docRef = await addDoc(collection(db, "groups"), {
                name: newGroup.name,
                description: newGroup.description,
                members: 1,
                category: newGroup.category,
                color: categoryInfo?.color || '#10b981',
                isActive: true,
                createdAt: new Date().toISOString(),
                createdBy: USER_ID
            });

            // Auto-join the newly created group
            const userGroupsRef = doc(db, "userGroups", USER_ID);
            const { setDoc } = await import('firebase/firestore');
            await setDoc(userGroupsRef, {
                groups: [...joinedGroups, docRef.id]
            }, { merge: true });

            setNewGroup({ name: '', description: '', category: 'wellness' });
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const selectedCategory = CATEGORY_OPTIONS.find(c => c.value === newGroup.category);

    if (loading) {
        return (
            <div className="groups-page">
                <header className="page-header">
                    <h2>Support Circles</h2>
                    <p className="page-subtitle">Loading...</p>
                </header>
            </div>
        );
    }

    return (
        <div className="groups-page">
            <header className="page-header">
                <h2>Support Circles</h2>
                <p className="page-subtitle">Find your tribe. Heal together.</p>
            </header>

            <div className="groups-grid">
                {groups.map(group => {
                    const isJoined = joinedGroups.includes(group.id);

                    return (
                        <article
                            key={group.id}
                            className={`group-card glass-panel ${isJoined ? 'joined' : ''}`}
                        >
                            <div className="group-icon" style={{ background: group.color, color: 'white' }}>
                                {group.icon}
                            </div>

                            <div className="group-info">
                                <h3>{group.name}</h3>
                                <p>{group.description}</p>
                                <div className="group-meta">
                                    <span className="member-count">
                                        <Users size={14} /> {group.members.toLocaleString()} members
                                    </span>
                                    {group.isActive && <span className="active-badge">Active Now</span>}
                                </div>
                            </div>

                            <button
                                className={`join-btn ${isJoined ? 'joined' : ''}`}
                                onClick={() => toggleJoin(group.id)}
                            >
                                {isJoined ? <><Check size={16} /> Joined</> : <><Plus size={16} /> Join</>}
                            </button>
                        </article>
                    );
                })}
            </div>

            <div className="create-group-cta glass-panel">
                <h4>Can't find your community?</h4>
                <p>Start your own support circle and invite others to join.</p>
                <button className="btn-glow" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> Create a Circle
                </button>
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            className="create-modal glass-panel"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Create a Support Circle</h3>
                                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGroup} className="create-form">
                                <div className="form-group">
                                    <label>Circle Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Morning Meditation Group"
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                                        maxLength={50}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="What is this circle about? What can members expect?"
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                                        maxLength={200}
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <div className="category-grid">
                                        {CATEGORY_OPTIONS.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                className={`category-option ${newGroup.category === cat.value ? 'selected' : ''}`}
                                                onClick={() => setNewGroup(prev => ({ ...prev, category: cat.value }))}
                                                style={{ '--cat-color': cat.color }}
                                            >
                                                <span className="cat-icon" style={{ color: cat.color }}>{cat.icon}</span>
                                                <span className="cat-label">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-preview">
                                    <span>Preview:</span>
                                    <div className="preview-card">
                                        <div className="preview-icon" style={{ background: selectedCategory?.color || '#10b981' }}>
                                            {selectedCategory?.icon || <Sparkles size={20} />}
                                        </div>
                                        <div className="preview-info">
                                            <strong>{newGroup.name || 'Your Circle Name'}</strong>
                                            <span>{newGroup.description || 'Your description here...'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-glow"
                                        disabled={!newGroup.name.trim() || !newGroup.description.trim()}
                                    >
                                        <Plus size={18} /> Create Circle
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
