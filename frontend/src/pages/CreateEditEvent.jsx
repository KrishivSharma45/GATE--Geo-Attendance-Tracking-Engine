import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import GeoMap from '../components/GeoMap.jsx';

export default function CreateEditEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    lat: '',
    lng: '',
    geofenceRadius: 150,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/events/${id}`).then(({ data }) => {
        const ev = data.event;
        setForm({
          title: ev.title,
          description: ev.description || '',
          venue: ev.venue,
          date: ev.date,
          time: ev.time,
          lat: ev.location.lat,
          lng: ev.location.lng,
          geofenceRadius: ev.geofenceRadius,
        });
      });
    }
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      lat: Number(form.lat),
      lng: Number(form.lng),
      geofenceRadius: Number(form.geofenceRadius),
    };
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  }

  const hasPin = form.lat !== '' && form.lng !== '';

  function pickLocation(lat, lng) {
    setForm((f) => ({ ...f, lat, lng }));
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="titles">
          <span className="eyebrow">Organizer</span>
          <h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
        </div>
      </div>

      <div className="split">
        <form onSubmit={handleSubmit}>
          <input placeholder="Title" value={form.title} onChange={update('title')} required />
          <input
            placeholder="Description"
            value={form.description}
            onChange={update('description')}
          />
          <input placeholder="Venue" value={form.venue} onChange={update('venue')} required />
          <div className="row">
            <input type="date" value={form.date} onChange={update('date')} required />
            <input type="time" value={form.time} onChange={update('time')} required />
          </div>
          <div className="row">
            <input placeholder="Latitude" value={form.lat} onChange={update('lat')} required />
            <input placeholder="Longitude" value={form.lng} onChange={update('lng')} required />
          </div>
          <button type="button" className="secondary" onClick={useMyLocation}>
            Use my location
          </button>
          <input
            placeholder="Geofence radius (meters)"
            type="number"
            value={form.geofenceRadius}
            onChange={update('geofenceRadius')}
          />
          <button type="submit">{isEdit ? 'Save changes' : 'Create event'}</button>
        </form>

        <aside className="geo-panel">
          <div className="cap">
            <span>Venue geofence</span>
            <span>{hasPin ? 'pinned' : 'not pinned'}</span>
          </div>
          <div className="geo-stage">
            <GeoMap
              lat={form.lat}
              lng={form.lng}
              radius={form.geofenceRadius}
              interactive
              onPick={pickLocation}
            />
          </div>
          <div className="geo-legend">
            <div className="lg-row">
              <span>Latitude</span>
              <span>{form.lat !== '' ? form.lat : '—'}</span>
            </div>
            <div className="lg-row">
              <span>Longitude</span>
              <span>{form.lng !== '' ? form.lng : '—'}</span>
            </div>
            <div className="lg-row">
              <span>Radius</span>
              <span>{form.geofenceRadius || 0} m</span>
            </div>
          </div>
          <p className="geo-note">
            Click the map to drop the venue pin, or drag it to fine-tune. Attendees must report a GPS
            position inside this radius for their scan to be accepted.
          </p>
        </aside>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
