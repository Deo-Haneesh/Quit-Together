import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageCircle, Heart, User, Bell, BookOpen, PenTool, Headphones, Mail, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BubblePopper from './BubblePopper';
import MemoryGame from './MemoryGame';
import ChatCompanion from './ChatCompanion';
import NearbyUsers from './NearbyUsers';
import UserChat from './UserChat';
import CursorGlow from './CursorGlow';
import EmergencySOS from './EmergencySOS';
import LanguageSelector from './LanguageSelector';
import UserSearch from './UserSearch';
import Avatar from './Avatar';

import TylerFlash from './TylerFlash';
import React, { useState, memo } from 'react';
import { useUser } from '../contexts/UserContext';
import { useGamification } from '../contexts/GamificationContext';
import { useMessages } from '../contexts/MessagesContext';
import LevelUpModal from './LevelUpModal';
import useUserHeartbeat from '../hooks/useUserHeartbeat';
import './Layout.css';

// Memoized nav item to prevent re-renders
const NavItem = memo(function NavItem({ item, isActive, index, badge, onClick }) {
  const Icon = item.icon;

  const handleClick = (e) => {
    if (item.action) {
      e.preventDefault();
      onClick(item.action);
    }
  };

  return (
    <Link
      to={item.path || '#'}
      className={`nav-item ${isActive ? 'active' : ''} ${item.mobileOnly ? 'mobile-only' : ''}`}
      onClick={handleClick}
    >
      <div
        className="nav-icon-wrapper"
        style={{
          animationDelay: `${index * 0.05}s`
        }}
      >
        <Icon size={22} />
        {badge > 0 && <span className="nav-badge notif-pulse">{badge}</span>}
      </div>
      <span className="nav-label">{item.label}</span>
      {isActive && <div className="nav-glow" />}
    </Link>
  );
});

// Simple scroll progress using CSS only
function ScrollProgress() {
  return <div className="scroll-progress" />;
}

// Lightweight animated background - CSS only, no JS
// Lightweight animated background - CSS only, no JS
function LightBackground() {
  return (
    <div className="light-background">
      <div className="bg-scanlines" />
      <div className="bg-noise" />
    </div>
  );
}

export default function Layout() {
  useUserHeartbeat();
  const location = useLocation();
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const { user } = useUser();
  const { gameState } = useGamification();
  const { unreadTotal } = useMessages();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.feed'), path: '/' },
    { icon: BookOpen, label: t('nav.stories'), path: '/stories' },
    { icon: MessageCircle, label: t('nav.groups'), path: '/groups' },
    { icon: Mail, label: t('nav.messages', 'Messages'), path: '/messages', badge: unreadTotal },
    { icon: Heart, label: t('nav.wellness'), path: '/wellness' },
    { icon: Headphones, label: t('nav.audio'), path: '/soundscapes' },
    { icon: PenTool, label: t('nav.journal'), path: '/journal' },
    { icon: Bell, label: t('nav.notifications'), path: '/notifications' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
    { icon: Search, label: t('nav.allies', 'Allies'), action: 'toggleUsers', mobileOnly: true },
  ];

  return (
    <div className="layout">
      {/* Lightweight CSS-only background */}
      <LightBackground />

      {/* Scroll Progress - CSS only */}
      <ScrollProgress />

      {/* Cursor effect - optimized */}
      <CursorGlow />

      {/* Sidebar Navigation - simplified, no Magnetic wrappers */}
      <aside className="sidebar glass-panel">
        <div className="brand">
          <div className="brand-icon">
            <img src="/combined.jpg" alt="Logo" className="logo-image" />
          </div>
          <h1 className="text-gradient-aurora">Quit-Together</h1>
        </div>

        <nav className="nav-menu">
          {navItems.map((item, index) => (
            <NavItem
              key={item.label}
              item={item}
              isActive={location.pathname === item.path || (item.action === 'toggleUsers' && showMobileUsers)}
              index={index}
              badge={item.badge}
              onClick={(action) => {
                if (action === 'toggleUsers') setShowMobileUsers(!showMobileUsers);
              }}
            />
          ))}
        </nav>

        <Link to="/profile" className="user-mini-profile">
          <div className="avatar-container">
            <Avatar src={user.avatar} alt={user.name} size="md" />
            <div className="level-badge-mini">{gameState.level}</div>
          </div>
          <div className="user-info">
            <span className="name">{user.name}</span>
            <span className="title text-gradient">{gameState.title}</span>
            <div className="xp-bar-mini">
              <div
                className="xp-fill"
                style={{ width: `${(gameState.xp % 100)}%` }}
              />
            </div>
          </div>
        </Link>
      </aside>

      <LevelUpModal />

      {/* Main Content Area - simpler page transitions */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Right Panel - Desktop: Sticky sidebar, Mobile: Overlay/Sheet */}
      <aside className={`right-panel ${showMobileUsers ? 'mobile-visible glass-panel' : ''}`}>
        <div className="mobile-panel-header">
          <h3>Allies</h3>
          <button onClick={() => setShowMobileUsers(false)}><X size={24} /></button>
        </div>
        <LanguageSelector />
        <BubblePopper />
        <MemoryGame />
        <NearbyUsers onChatStart={(user) => {
          setActiveChatUser(user);
          setShowMobileUsers(false);
        }} />
      </aside>

      {/* Floating Components */}
      <ChatCompanion />
      <EmergencySOS />
      <TylerFlash />

      <AnimatePresence>
        {activeChatUser && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.2 }}
          >
            <UserChat
              user={activeChatUser}
              onClose={() => setActiveChatUser(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
