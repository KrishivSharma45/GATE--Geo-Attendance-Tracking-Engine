import { Routes, Route } from 'react-router-dom';
import Landing from './pages/landing.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EventsList from './pages/EventsList.jsx';
import ScanPage from './pages/ScanPage.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import CreateEditEvent from './pages/CreateEditEvent.jsx';
import EventAttendance from './pages/EventAttendance.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div className="grid-bg" aria-hidden="true">
        <span className="grid-bg-lines" />
        <span className="grid-bg-glow" />
      </div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/events"
            element={
              <PrivateRoute role="attendee">
                <EventsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id/scan"
            element={
              <PrivateRoute role="attendee">
                <ScanPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="organizer">
                <OrganizerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              <PrivateRoute role="organizer">
                <CreateEditEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <PrivateRoute role="organizer">
                <CreateEditEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id/manage"
            element={
              <PrivateRoute role="organizer">
                <EventAttendance />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Landing />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
