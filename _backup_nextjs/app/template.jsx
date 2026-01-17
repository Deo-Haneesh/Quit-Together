'use client';

import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Template({ children }) {
    return (
        <ErrorBoundary>
            <Layout>
                {children}
            </Layout>
        </ErrorBoundary>
    );
}
