'use client';

import React from 'react';
import './BubbleBackground.css';

export default function BubbleBackground() {
    return (
        <div className="bubble-background">
            {[...Array(15)].map((_, i) => (
                <div key={i} className="bubble" />
            ))}
        </div>
    );
}
