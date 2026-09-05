import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);

  async function load() {
    const { data } = await api.get('/events');
    setEvents(data.events);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`);
    load();
  }

  const upcoming = events.filter((ev) => {
    const t = Date.parse(`${ev.date}T${ev.time || '00:00'}`);
    return !Number.isNaN(t) && t >= Date.now();
  }).length;

  return (
    <div className="card">
      <div className="card-head">
        <div className="titles">
          <span className="eyebrow">Organizer</span>
          <h2>My Events</h2>
        </div>
        <Link to="/events/new">
          <button>+ Create Event</button>
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="num">{events.length}</span>
          <span className="label">Total events</span>
        </div>
        <div className="stat">
          <span className="num">{upcoming}</span>
          <span className="label">Upcoming</span>
        </div>
        <div className="stat">
          <span className="num">{Math.max(events.length - upcoming, 0)}</span>
          <span className="label">Past</span>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="empty-note">No events yet — create your first one.</p>
      ) : (
        <div className="event-grid">
          {events.map((ev) => (
            <article className="event-item" key={ev._id}>
              <div className="ev-main">
                <strong>{ev.title}</strong>
                <span className="ev-meta">
                  {ev.venue} · {ev.date} at {ev.time}
                </span>
              </div>
              <div className="actions">
                <Link to={`/events/${ev._id}/manage`}>
                  <button>Manage / QR / Attendance</button>
                </Link>
                <Link to={`/events/${ev._id}/edit`}>
                  <button className="secondary">Edit</button>
                </Link>
                <button className="secondary" onClick={() => handleDelete(ev._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
