'use client';

import '@/lib/i18n'; // Initialize i18n on client side

import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { MessagesProvider } from '@/contexts/MessagesContext';

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <UserProvider>
                <GamificationProvider>
                    <ContentProvider>
                        <NotificationProvider>
                            <SocialProvider>
                                <MessagesProvider>
                                    {children}
                                </MessagesProvider>
                            </SocialProvider>
                        </NotificationProvider>
                    </ContentProvider>
                </GamificationProvider>
            </UserProvider>
        </ThemeProvider>
    );
}
