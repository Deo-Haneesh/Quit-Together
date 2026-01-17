'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, Trophy, Bell, UserPlus, Flame, CheckCircle,
    Filter, Settings, Trash2, X, Sparkles
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import '@/pages/Notifications.css';

// Icon mapping for notification types
const getNotificationIcon = (type) => {
    const icons = {
        like: { icon: Heart, color: '#ef4444' },
        comment: { icon: MessageCircle, color: '#3b82f6' },
        follow: { icon: UserPlus, color: '#a855f7' },
        mention: { icon: MessageCircle, color: '#06b6d4' },
        achievement: { icon: Trophy, color: '#10b981' },
        streak: { icon: Flame, color: '#f59e0b' },
        system: { icon: Bell, color: '#64748b' },
        welcome: { icon: Sparkles, color: '#8b5cf6' }
    };
    return icons[type] || icons.system;
};

// Format relative time
const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
};

// Group notifications by date category
const groupByDate = (notifications) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return notifications.reduce((groups, notif) => {
        const date = new Date(notif.createdAt || notif.timestamp || Date.now());
        let group;

        if (date >= today) {
            group = 'Today';
        } else if (date >= yesterday) {
            group = 'Yesterday';
        } else if (date >= weekAgo) {
            group = 'This Week';
        } else {
            group = 'Earlier';
        }

        if (!groups[group]) groups[group] = [];
        groups[group].push(notif);
        return groups;
    }, {});
};

// Single notification item
function NotificationItem({ notification, onDismiss, onRead }) {
    const { icon: Icon, color } = getNotificationIcon(notification.type);
    const [isDismissing, setIsDismissing] = useState(false);

    const handleDismiss = () => {
        setIsDismissing(true);
        setTimeout(() => onDismiss?.(notification.id), 300);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{
                opacity: isDismissing ? 0 : 1,
                x: isDismissing ? 100 : 0,
                height: isDismissing ? 0 : 'auto'
            }}
            exit={{ opacity: 0, x: 100, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`notification-item glass-panel ${!notification.read ? 'unread' : ''}`}
            onClick={() => onRead?.(notification.id)}
        >
            <motion.div
                className="notif-icon"
                style={{ background: color }}
                whileHover={{ scale: 1.1, rotate: 10 }}
            >
                <Icon size={18} />
            </motion.div>

            <div className="notif-content">
                <p className="notif-action">
                    {notification.actorName && <strong>{notification.actorName}</strong>}
                    {' '}{notification.message || notification.action}
                </p>
                {notification.preview && (
                    <p className="notif-preview">"{notification.preview}"</p>
                )}
            </div>

            <div className="notif-meta">
                <span className="notif-time">{formatTime(notification.createdAt || notification.timestamp)}</span>
                <motion.button
                    className="dismiss-btn"
                    onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X size={14} />
                </motion.button>
            </div>

            {!notification.read && <div className="unread-dot" />}
        </motion.div>
    );
}

export default function Notifications() {
    const { t } = useTranslation();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading
    } = useNotifications();

    const [filter, setFilter] = useState('all');
    const [dismissedIds, setDismissedIds] = useState(new Set());

    // Filter and group notifications
    const filteredNotifications = useMemo(() => {
        let result = notifications.filter(n => !dismissedIds.has(n.id));

        if (filter === 'unread') {
            result = result.filter(n => !n.read);
        } else if (filter !== 'all') {
            result = result.filter(n => n.type === filter);
        }

        return result;
    }, [notifications, filter, dismissedIds]);

    const groupedNotifications = useMemo(() =>
        groupByDate(filteredNotifications), [filteredNotifications]
    );

    const handleDismiss = (id) => {
        setDismissedIds(prev => new Set([...prev, id]));
    };

    const handleRead = (id) => {
        markAsRead(id);
    };

    // Demo notifications for when context is empty
    const demoNotifications = [
        { id: 1, type: 'like', actorName: 'Sarah K.', action: 'liked your post', preview: 'Just hit 30 days...', timestamp: new Date(Date.now() - 120000), read: false },
        { id: 2, type: 'comment', actorName: 'Mike R.', action: 'commented on your post', preview: 'This is so inspiring!', timestamp: new Date(Date.now() - 900000), read: false },
        { id: 3, type: 'streak', action: 'Your streak is on fire!', preview: "You've checked in 7 days in a row", timestamp: new Date(Date.now() - 3600000), read: true },
        { id: 4, type: 'achievement', action: 'You earned a new badge!', preview: 'First Week Champion 🏆', timestamp: new Date(Date.now() - 10800000), read: true },
        { id: 5, type: 'follow', actorName: 'David L.', action: 'started following you', timestamp: new Date(Date.now() - 86400000), read: true },
        { id: 6, type: 'welcome', action: 'Welcome to Quit-Together!', preview: 'Your journey starts now.', timestamp: new Date(Date.now() - 172800000), read: true },
    ];

    const displayNotifications = notifications.length > 0 ? filteredNotifications : demoNotifications;
    const displayGroups = notifications.length > 0 ? groupedNotifications : groupByDate(demoNotifications);
    const displayUnread = notifications.length > 0 ? unreadCount : demoNotifications.filter(n => !n.read).length;

    return (
        <motion.div
            className="notifications-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="notifications-header">
                <div className="header-left">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                    >
                        <Bell size={28} className="header-icon" />
                    </motion.div>
                    <div>
                        <h2>{t('notifications.title', 'Notifications')}</h2>
                        {displayUnread > 0 && (
                            <motion.span
                                className="unread-badge notif-pulse"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                {displayUnread} {t('notifications.new', 'new')}
                            </motion.span>
                        )}
                    </div>
                </div>

                <div className="header-actions">
                    {displayUnread > 0 && (
                        <motion.button
                            className="mark-read-btn btn-magnetic"
                            onClick={markAllAsRead}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CheckCircle size={16} />
                            <span>{t('notifications.markAllRead', 'Mark all read')}</span>
                        </motion.button>
                    )}
                </div>
            </header>

            {/* Filter tabs */}
            <div className="filter-tabs">
                {['all', 'unread', 'like', 'comment', 'follow', 'achievement'].map((f) => (
                    <motion.button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </motion.button>
                ))}
            </div>

            {/* Notification groups */}
            <div className="notifications-container">
                {loading ? (
                    <div className="loading-state">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton-notification">
                                <div className="skeleton skeleton-icon" />
                                <div className="skeleton-content">
                                    <div className="skeleton skeleton-line w-75" />
                                    <div className="skeleton skeleton-line w-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : Object.keys(displayGroups).length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="empty-icon">
                            <Bell size={48} />
                        </div>
                        <h3>{t('notifications.empty', 'All caught up!')}</h3>
                        <p>{t('notifications.emptyDesc', "You don't have any notifications right now.")}</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {Object.entries(displayGroups).map(([group, items]) => (
                            <motion.div
                                key={group}
                                className="notification-group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <h3 className="group-title">{group}</h3>
                                <div className="notification-list">
                                    <AnimatePresence mode="popLayout">
                                        {items.map((notif, index) => (
                                            <NotificationItem
                                                key={notif.id}
                                                notification={notif}
                                                onDismiss={handleDismiss}
                                                onRead={handleRead}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
