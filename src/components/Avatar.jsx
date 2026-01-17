import React, { useState } from 'react';
import { User } from 'lucide-react';
import './Avatar.css';

export default function Avatar({ src, alt, size = "md", className = "" }) {
    const [error, setError] = useState(false);

    // If src is a URL and hasn't errored, render Image
    const isUrl = src && (src.startsWith('http') || src.startsWith('/'));

    // If it's not a URL (e.g. emoji or initials) or if image failed
    if (!isUrl || error) {
        return (
            <div className={`avatar-component avatar-${size} ${className} fallback`}>
                {(!isUrl && src) ? src : <User size={size === 'sm' ? 14 : size === 'lg' ? 32 : 20} />}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt || "User"}
            className={`avatar-component avatar-${size} ${className}`}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
        />
    );
}
