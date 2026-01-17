import React from 'react';
import Soundscapes from '../components/Soundscapes';

export default function SoundscapesPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <h2>Audio Sanctuary</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Escape into calming sounds to reduce stress and improve focus
                </p>
            </header>

            <Soundscapes />
        </div>
    );
}
