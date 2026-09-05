import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate(data.user.role === 'organizer' ? '/dashboard' : '/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
              <span className="d">Every event carries its own single-purpose code.</span>
            </span>
          </li>
          <li>
            <span className="n">2</span>
            <span>
              <span className="t">We verify you are actually there</span>
              <span className="d">Live GPS checked against the venue geofence radius.</span>
            </span>
          </li>
          <li>
            <span className="n">3</span>
            <span>
              <span className="t">You are marked present — instantly</span>
              <span className="d">One check-in per person, written the moment you are verified.</span>
            </span>
          </li>
          <li>
            <span className="n">4</span>
            <span>
              <span className="t">Organizers export in one click</span>
              <span className="d">Search, filter and download the whole roster as CSV.</span>
            </span>
          </li>
        </ol>
        <div className="auth-quote">
          <p>
            &ldquo;We switched three campuses over to GATE in a week. Proxy attendance just stopped
            being a conversation.&rdquo;
          </p>
          <div className="who">
            <span className="avatar">AM</span>
            <span>
              <b>Arjun Menon</b>
              <span>Operations, Meridian Institute</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h2>Signup</h2>
        <p className="sub">Create your account to start tracking verified attendance.</p>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={form.name} onChange={update('name')} required />
          <input placeholder="Email" value={form.email} onChange={update('email')} required />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            required
          />
          <select value={form.role} onChange={update('role')}>
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
          </select>
          <button type="submit">Register</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
