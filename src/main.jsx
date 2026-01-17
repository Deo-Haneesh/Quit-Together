import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { GamificationProvider } from './contexts/GamificationContext'
import { ContentProvider } from './contexts/ContentContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { SocialProvider } from './contexts/SocialContext'
import { MessagesProvider } from './contexts/MessagesContext'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <UserProvider>
          <GamificationProvider>
            <ContentProvider>
              <NotificationProvider>
                <SocialProvider>
                  <MessagesProvider>
                    <App />
                  </MessagesProvider>
                </SocialProvider>
              </NotificationProvider>
            </ContentProvider>
          </GamificationProvider>
        </UserProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
