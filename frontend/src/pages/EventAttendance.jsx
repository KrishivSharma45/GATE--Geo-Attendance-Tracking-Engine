import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';

export default function EventAttendance() {
  const { id } = useParams();
  const [data, setData] = useState({ event: {}, records: [] });
  const [qr, setQr] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/attendance/${id}`, { params: { search } }).then(({ data }) => setData(data));
  }, [id, search]);

  useEffect(() => {
    api.get(`/events/${id}/qrcode`).then(({ data }) => setQr(data.qrDataUrl));
  }, [id]);

  async function handleExport() {
    const res = await api.get(`/attendance/${id}/export`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(data.event.title || 'attendance').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const records = data.records || [];
  const distances = records
    .map((r) => Number(r.distanceFromVenue))
    .filter((n) => !Number.isNaN(n));
  const avgDistance = distances.length
    ? Math.round(distances.reduce((a, b) => a + b, 0) / distances.length)
    : null;
  const lastCheckIn = records.length
    ? new Date(Math.max(...records.map((r) => new Date(r.timestamp).getTime()))).toLocaleTimeString(
        [],
        { hour: '2-digit', minute: '2-digit' }
      )
    : null;

  return (
    <div className="card">
      <div className="card-head">
        <div className="titles">
          <span className="eyebrow">Organizer</span>
          <h2>{data.event.title || 'Event attendance'}</h2>
        </div>
        <button onClick={handleExport}>Export CSV</button>
      </div>

      <div className="split attendance">
        <div>
          <div className="stat-grid">
            <div className="stat">
              <span className="num">{records.length}</span>
              <span className="label">Total present</span>
            </div>
            <div className="stat">
              <span className="num">{avgDistance === null ? '—' : `${avgDistance}m`}</span>
              <span className="label">Avg. distance</span>
            </div>
            <div className="stat">
              <span className="num sm">{lastCheckIn || '—'}</span>
              <span className="label">Last check-in</span>
            </div>
          </div>
          <div className="row" style={{ marginTop: '1.1rem' }}>
            <input
              placeholder="Search attendee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {qr && (
          <div className="qr-card">
            <img src={qr} alt="Event QR" width={200} />
            <span>Scan to check in</span>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Registration ID</th>
              <th>Email</th>
              <th>Timestamp</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.user.name}</td>
                <td>{r.user.registrationId}</td>
                <td>{r.user.email}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.distanceFromVenue}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
