import React from 'react';
import Journal from '../components/Journal';
import BurnBook from '../components/BurnBook';

export default function JournalPage() {
    return (
        <div className="page-container">
            <header className="page-header" style={{ marginBottom: '0' }}>
                <h2>My Journal</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    A private space for your thoughts, gratitude, and reflection
                </p>
            </header>

            <div style={{ marginTop: 'var(--space-xl)' }}>
                {/* Burn Book Section Override */}
                <BurnBook />
            </div>

            {/* Hidden Regular Journal for now to emphasize Burn Book */}
            {/* <Journal /> */}
        </div>
    );
}
