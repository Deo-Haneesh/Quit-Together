'use client';

import React, { useState } from 'react';
import { Users, MessageCircle, MapPin, Circle, X, Flame, Clock } from 'lucide-react';
import './NearbyUsers.css';

const nearbyUsers = [
    { id: 1, name: 'Alex', avatar: 'AK', status: 'online', streak: 15, distance: '0.5 km', bio: 'Day by day, getting stronger 💪' },
    { id: 2, name: 'Jamie', avatar: 'JM', status: 'online', streak: 8, distance: '1.2 km', bio: 'Recovery is my priority' },
    { id: 3, name: 'Sam', avatar: 'SP', status: 'away', streak: 23, distance: '2.0 km', bio: 'One step at a time 🌿' },
    { id: 4, name: 'Taylor', avatar: 'TL', status: 'online', streak: 5, distance: '3.5 km', bio: 'New to this journey' },
    { id: 5, name: 'Jordan', avatar: 'JD', status: 'online', streak: 42, distance: '4.1 km', bio: 'Mentor & supporter' },
    { id: 6, name: 'Casey', avatar: 'CY', status: 'away', streak: 12, distance: '5.0 km', bio: 'Finding my path' },
    { id: 7, name: 'Morgan', avatar: 'MG', status: 'offline', streak: 3, distance: '6.2 km', bio: 'Just started!' },
    { id: 8, name: 'Riley', avatar: 'RL', status: 'online', streak: 67, distance: '7.5 km', bio: 'Veteran - ask me anything' },
];

export default function NearbyUsers({ onChatStart }) {
    const [showAllModal, setShowAllModal] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'online', 'nearby'

    const displayedUsers = nearbyUsers.slice(0, 4);

    const filteredUsers = nearbyUsers.filter(user => {
        if (filter === 'online') return user.status === 'online';
        if (filter === 'nearby') return parseFloat(user.distance) < 3;
        return true;
    });

    const handleChatStart = (user) => {
        setShowAllModal(false);
        onChatStart?.({ ...user, initial: user.avatar });
    };

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
                <span className="online-count">{nearbyUsers.filter(u => u.status === 'online').length} online</span>
            </div>

            <div className="users-list">
                {displayedUsers.map((user, index) => (
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
                                    <MapPin size={10} />
                                    {user.distance}
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
                ))}
            </div>

            <button className="view-all-btn" onClick={() => setShowAllModal(true)}>
                View all nearby users →
            </button>

            {/* All Users Modal */}
            {showAllModal && (
                <div className="nearby-modal-overlay" onClick={() => setShowAllModal(false)}>
                    <div className="nearby-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="nearby-modal-header">
                            <h3><Users size={20} /> All Nearby Allies</h3>
                            <button className="close-modal-btn" onClick={() => setShowAllModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({nearbyUsers.length})
                            </button>
                            <button
                                className={`filter-tab ${filter === 'online' ? 'active' : ''}`}
                                onClick={() => setFilter('online')}
                            >
                                Online ({nearbyUsers.filter(u => u.status === 'online').length})
                            </button>
                            <button
                                className={`filter-tab ${filter === 'nearby' ? 'active' : ''}`}
                                onClick={() => setFilter('nearby')}
                            >
                                Nearby (&lt;3km)
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
                                                {user.status === 'online' ? '● Online' : user.status === 'away' ? '○ Away' : '◌ Offline'}
                                            </span>
                                        </div>
                                        <p className="all-user-bio">{user.bio}</p>
                                        <div className="all-user-stats">
                                            <span className="stat"><Flame size={12} /> {user.streak} days</span>
                                            <span className="stat"><MapPin size={12} /> {user.distance}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="chat-action-btn"
                                        onClick={() => handleChatStart(user)}
                                        disabled={user.status === 'offline'}
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
