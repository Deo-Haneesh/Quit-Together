import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, MapPin, Circle, X, Flame, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './NearbyUsers.css';

export default function NearbyUsers({ onChatStart }) {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllModal, setShowAllModal] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'online', 'nearby'

    // Fetch ONLY real users from Firestore
    useEffect(() => {
        if (!currentUser) return;

        // Query users who have logged in recently
        // In a real app, we'd index on 'lastSeen'
        const q = query(
            collection(db, "users"),
            orderBy("lastSeen", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const realUsers = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    // Determine online status based on heartbeat (5min threshold)
                    const lastSeenDate = data.lastSeen?.toDate?.() || new Date(0);
                    const isOnline = (new Date() - lastSeenDate) < 5 * 60 * 1000;

                    return {
                        id: doc.id,
                        name: data.name || 'Anonymous',
                        avatar: data.avatar || '??',
                        status: isOnline ? 'online' : 'offline',
                        // Calculate "streak" from real data
                        streak: data.stats?.streakDays || 0,
                        // Mock distance since we don't have GPS in this MVP
                        distance: 'Unknown',
                        bio: data.bio || 'Member',
                        lastSeen: lastSeenDate
                    };
                })
                .filter(u => u.id !== currentUser.uid); // Exclude self

            setUsers(realUsers);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching nearby users:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);


    const displayedUsers = users.slice(0, 4);

    const filteredUsers = users.filter(user => {
        if (filter === 'online') return user.status === 'online';
        // Mock "nearby" filter since we don't have distance
        if (filter === 'nearby') return true;
        return true;
    });

    const handleChatStart = (user) => {
        setShowAllModal(false);
        onChatStart?.({ ...user, initial: user.avatar });
    };

    if (loading) return (
        <div className="nearby-users card-3d loading">
            <div className="skeleton-line" />
            <div className="skeleton-line" style={{ width: '60%' }} />
        </div>
    );

    return (
        <div className="nearby-users card-3d">
            <div className="nearby-header">
                <div className="nearby-icon">
                    <Users size={18} />
                </div>
                <div className="nearby-title">
                    <h4>Nearby Allies</h4>
                    <p>Connect with others</p>
                </div>
                <span className="online-count">
                    {users.filter(u => u.status === 'online').length} online
                </span>
            </div>

            <div className="users-list">
                {users.length === 0 ? (
                    <div className="empty-state-small">
                        <Users size={24} style={{ opacity: 0.3 }} />
                        <p>No other users online yet.</p>
                        <small>Share the app to grow the tribe!</small>
                    </div>
                ) : (
                    displayedUsers.map((user, index) => (
                        <div
                            key={user.id}
                            className="user-item"
                            style={{ '--index': index }}
                        >
                            <div className="user-avatar-wrapper">
                                <div className="user-avatar">{user.avatar}</div>
                                <span className={`status-dot ${user.status}`}>
                                    <Circle size={8} fill="currentColor" />
                                </span>
                            </div>

                            <div className="user-details">
                                <span className="user-name">{user.name}</span>
                                <div className="user-meta">
                                    <span className="streak">🔥 {user.streak}</span>
                                    <span className="distance">
                                        <Clock size={10} />
                                        {user.status === 'online' ? 'Now' :
                                            Math.floor((new Date() - user.lastSeen) / 60000) + 'm ago'}
                                    </span>
                                </div>
                            </div>

                            <button
                                className="chat-btn"
                                onClick={() => handleChatStart(user)}
                                title={`Chat with ${user.name}`}
                            >
                                <MessageCircle size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {users.length > 4 && (
                <button className="view-all-btn" onClick={() => setShowAllModal(true)}>
                    View all nearby users →
                </button>
            )}

            {/* All Users Modal */}
            {showAllModal && (
                <div className="nearby-modal-overlay" onClick={() => setShowAllModal(false)}>
                    <div className="nearby-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="nearby-modal-header">
                            <h3><Users size={20} /> All Allies</h3>
                            <button className="close-modal-btn" onClick={() => setShowAllModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({users.length})
                            </button>
                            <button
                                className={`filter-tab ${filter === 'online' ? 'active' : ''}`}
                                onClick={() => setFilter('online')}
                            >
                                Online ({users.filter(u => u.status === 'online').length})
                            </button>
                        </div>

                        <div className="all-users-list">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="all-user-card">
                                    <div className="all-user-avatar-wrapper">
                                        <div className="all-user-avatar">{user.avatar}</div>
                                        <span className={`status-indicator ${user.status}`}></span>
                                    </div>
                                    <div className="all-user-info">
                                        <div className="all-user-name-row">
                                            <span className="all-user-name">{user.name}</span>
                                            <span className={`status-badge ${user.status}`}>
                                                {user.status === 'online' ? '● Online' : '◌ Offline'}
                                            </span>
                                        </div>
                                        <p className="all-user-bio">{user.bio}</p>
                                        <div className="all-user-stats">
                                            <span className="stat"><Flame size={12} /> {user.streak} days</span>
                                        </div>
                                    </div>
                                    <button
                                        className="chat-action-btn"
                                        onClick={() => handleChatStart(user)}
                                    >
                                        <MessageCircle size={18} />
                                        Chat
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
