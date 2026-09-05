import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(data.user.role === 'organizer' ? '/dashboard' : '/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-brand">
          <span className="brand-mark">G</span>
          GATE
        </div>
        <ol className="auth-steps">
          <li>
            <span className="n">1</span>
            <span>
              <span className="t">Scan the event QR</span>
              <span className="d">One tap on the code your organizer displays.</span>
            </span>
          </li>
          <li>
            <span className="n">2</span>
            <span>
              <span className="t">We verify you are actually there</span>
              <span className="d">Your live GPS fix is matched to the venue geofence.</span>
            </span>
          </li>
          <li>
            <span className="n">3</span>
            <span>
              <span className="t">You are marked present — instantly</span>
              <span className="d">A timestamped record hits the dashboard in real time.</span>
            </span>
          </li>
        </ol>
        <div className="auth-quote">
          <p>
            &ldquo;Roll call used to eat the first ten minutes of every session. With GATE the room is
            checked in before I finish setting up.&rdquo;
          </p>
          <div className="who">
            <span className="avatar">RK</span>
            <span>
              <b>Riya Kulkarni</b>
              <span>Program Lead, Northline Workshops</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>
        <h2>Login</h2>
        <p className="sub">Welcome back — sign in to manage or mark attendance.</p>
        <form onSubmit={handleSubmit}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
