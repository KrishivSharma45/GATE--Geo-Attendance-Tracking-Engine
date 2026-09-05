import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/events', { params: { search } }).then(({ data }) => setEvents(data.events));
  }, [search]);

  return (
    <div className="card">
      <div className="card-head">
        <div className="titles">
          <span className="eyebrow">Attendee</span>
          <h2>Upcoming Events</h2>
        </div>
      </div>

      <input
        placeholder="Search by title or venue"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {events.length === 0 ? (
        <p className="empty-note">No events found.</p>
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
                <Link to={`/events/${ev._id}/scan`}>
                  <button>Scan to Mark Attendance</button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
