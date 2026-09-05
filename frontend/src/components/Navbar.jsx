import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function scrollToHow() {
    const target = document.getElementById('how');
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // fallback for environments where scrollIntoView is a no-op
    const y = target.getBoundingClientRect().top + window.pageYOffset - 72;
    window.scrollTo({ top: y, behavior: 'smooth' });
    return true;
  }

  function goToHowItWorks(e) {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToHow();
      return;
    }
    navigate('/');
    // wait for the landing route to mount, retrying a few times
    let tries = 0;
    const tick = () => {
      if (scrollToHow() || tries++ > 12) return;
      setTimeout(tick, 60);
    };
    setTimeout(tick, 60);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">G</span>
        <span className="brand-name">GATE</span>
        <span className="brand-sub">Geo Attendance Tracking Engine</span>
      </Link>

      <div className="nav-links">
        <a href="/#how" className="nav-item nav-how" onClick={goToHowItWorks}>
          How it works
        </a>
        <span className="nav-sep" aria-hidden="true" />
        {user ? (
          <>
            <span className="nav-user">
              {user.name} <em>({user.role})</em>
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">
              Login
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
