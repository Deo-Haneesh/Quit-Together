'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    return (
        <button
            className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="toggle-track">
                <div className="toggle-icons">
                    <Sun size={14} className="sun-icon" />
                    <Moon size={14} className="moon-icon" />
                </div>
                <div className="toggle-thumb">
                    {isDark ? <Moon size={12} /> : <Sun size={12} />}
                    <Sparkles size={8} className="sparkle" />
                </div>
            </div>
            <span className="toggle-label">{isDark ? 'Dark' : 'Light'}</span>
        </button>
    );
}
