import React from 'react';
import './AmbientParticles.css';

export default function AmbientParticles() {
    return (
        <div className="ambient-particles">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="particle" />
            ))}
        </div>
    );
}
