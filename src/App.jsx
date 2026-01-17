import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Stories from './pages/Stories';
import Groups from './pages/Groups';
import Wellness from './pages/Wellness';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import JournalPage from './pages/JournalPage';
import SoundscapesPage from './pages/SoundscapesPage';
import GamesHub from './pages/GamesHub';
import Messages from './pages/Messages';
import Login from './pages/Login';
import SystemDiagnostics from './pages/SystemDiagnostics';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="stories" element={<Stories />} />
            <Route path="groups" element={<Groups />} />
            <Route path="wellness" element={<Wellness />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="soundscapes" element={<SoundscapesPage />} />
            <Route path="games" element={<GamesHub />} />
            <Route path="games" element={<GamesHub />} />
            <Route path="messages" element={<Messages />} />
            <Route path="system-check" element={<SystemDiagnostics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

