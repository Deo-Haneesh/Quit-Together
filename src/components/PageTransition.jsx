import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Wraps page content with smooth enter/exit animations
 */
export const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
                duration: 0.3
            }}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

/**
 * SlideTransition - Slide in from direction
 */
export const SlideTransition = ({ children, direction = 'right' }) => {
    const directions = {
        left: { x: -100 },
        right: { x: 100 },
        up: { y: -100 },
        down: { y: 100 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...directions[direction === 'left' ? 'right' : direction === 'right' ? 'left' : direction === 'up' ? 'down' : 'up'] }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

/**
 * FadeScale - Fade in with subtle scale
 */
export const FadeScale = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
            duration: 0.25,
            delay,
            ease: [0.4, 0, 0.2, 1]
        }}
    >
        {children}
    </motion.div>
);

/**
 * Skeleton loading component
 */
export const Skeleton = ({ width = '100%', height = '1rem', radius = '0.5rem', className = '' }) => (
    <div
        className={`skeleton ${className}`}
        style={{
            width,
            height,
            borderRadius: radius,
            background: 'linear-gradient(90deg, var(--glass) 25%, rgba(255,255,255,0.1) 50%, var(--glass) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
        }}
    />
);

/**
 * SkeletonCard - Card-shaped loading placeholder
 */
export const SkeletonCard = ({ lines = 3 }) => (
    <div className="skeleton-card glass-panel" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Skeleton width="40px" height="40px" radius="50%" />
            <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="0.875rem" />
                <Skeleton width="40%" height="0.75rem" className="mt-2" />
            </div>
        </div>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                width={`${100 - i * 15}%`}
                height="0.75rem"
                className="mt-2"
            />
        ))}
    </div>
);

export default PageTransition;
