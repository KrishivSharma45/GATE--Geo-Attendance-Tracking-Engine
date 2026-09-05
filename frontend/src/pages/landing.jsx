import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Reveal from '../components/Reveal.jsx';
import GeoMap from '../components/GeoMap.jsx';

const STEPS = [
  {
    n: '01',
    title: 'Scan the event QR',
    body: 'Open your camera on the code the organizer displays. Every event carries its own single-purpose QR.',
  },
  {
    n: '02',
    title: 'Verify your location',
    body: 'Your live GPS fix is matched against the venue geofence. Outside the radius, the check-in is rejected.',
  },
  {
    n: '03',
    title: 'Attendance marked',
    body: 'A timestamped record lands on the organizer dashboard instantly. One check-in per person, enforced.',
  },
];

const SPECS = [
  { t: 'Unique QR / event', d: 'Auto-generated, scoped to a single event.' },
  { t: 'GPS geofence', d: 'Configurable radius around the venue pin.' },
  { t: '1 check-in / person', d: 'Enforced at the database level.' },
  { t: 'CSV export', d: 'Full roster, one click, from the dashboard.' },
];

export default function Landing() {
  const { user } = useAuth();
  const homeLink = user ? (user.role === 'organizer' ? '/dashboard' : '/events') : '/register';

  const cta = user ? (
    <Link to={homeLink}>
      <button className="btn-lg">Go to my dashboard</button>
    </Link>
  ) : (
    <>
      <Link to="/register">
        <button className="btn-lg">Get Started</button>
      </Link>
      <Link to="/login">
        <button className="secondary btn-lg">Login</button>
      </Link>
    </>
  );

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy hero-in">
          <span className="eyebrow">Geo-verified QR attendance</span>
          <h1>
            <span className="line">Prove</span>
            <span className="line">you were</span>
            <span className="line dim">there.</span>
          </h1>
          <p className="lede">
            GATE binds every check-in to a live location fix. Attendees scan the event QR, their GPS
            is matched against the venue geofence, and the record is written the instant they are
            proven present.
          </p>
          <div className="hero-actions">{cta}</div>
          <div className="hero-meta">
            <div>
              <span className="k">1 scan</span>
              <span className="v">to check in</span>
            </div>
            <div>
              <span className="k">~10s</span>
              <span className="v">end to end</span>
            </div>
            <div>
              <span className="k">0</span>
              <span className="v">proxy check-ins</span>
            </div>
          </div>
        </div>

        <div className="hero-panel hero-in" style={{ animationDelay: '80ms' }}>
          <GeoMap
            lat={13.0827}
            lng={80.2707}
            radius={150}
            markerVariant="qr"
            fallbackZoom={15}
            className="hero-map"
          />
          <span className="hero-panel-scrim" aria-hidden="true" />
          <span className="corner tl">GATE / LOCATION LOCK</span>
          <span className="corner tr">● LIVE</span>
          <span className="corner bl">RADIUS 150 m</span>
          <span className="corner br">01 · SCAN</span>
        </div>
      </section>

      <Reveal as="section" className="manifesto">
        <p>
          <span className="hl">Attendance you can trust.</span> Every check-in is bound to a live GPS
          fix, matched against the venue geofence, and written{' '}
          <span className="hl">the instant a person is proven present.</span> No proxies. No paper. No
          roll calls.
        </p>
      </Reveal>

      <section className="how" id="how">
        <Reveal className="how-head">
          <h2>How it works</h2>
          <span className="pill">3 steps · ~10 seconds</span>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal className="step" key={s.n} delay={i * 110}>
              <div className="numeral">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" className="spec-strip">
        {SPECS.map((s) => (
          <div className="spec" key={s.t}>
            <div className="st">{s.t}</div>
            <div className="sd">{s.d}</div>
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="landing-cta">
        <h2>
          Set up your first event <span className="dim">in a minute.</span>
        </h2>
        <p>
          Create an event, drop a pin on the venue, share the QR. GATE handles the verification and
          the paperwork.
        </p>
        <div className="hero-actions">{cta}</div>
      </Reveal>
    </div>
  );
}
