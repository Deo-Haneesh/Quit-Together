import { createContext, useContext, useState, useEffect } from 'react';

const ViewModeContext = createContext();

export function ViewModeProvider({ children }) {
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('viewMode') || 'auto';
        }
        return 'auto';
    });

    useEffect(() => {
        localStorage.setItem('viewMode', viewMode);
    }, [viewMode]);

    const toggleViewMode = () => {
        setViewMode(prev => {
            if (prev === 'auto') return 'desktop';
            if (prev === 'desktop') return 'mobile';
            return 'auto';
        });
    };

    return (
        <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode() {
    const context = useContext(ViewModeContext);
    if (!context) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
}
