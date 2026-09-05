import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios.js';

export default function ScanPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Point your camera at the event QR code');
  const [result, setResult] = useState(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    const qr = new Html5Qrcode('reader');

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        if (scanLockRef.current) return;
        scanLockRef.current = true;
        try {
          await qr.stop();
        } catch (e) {
          // ignore stop errors
        }
        handleScan(decodedText);
      },
      () => {}
    ).catch((err) => setStatus('Camera error: ' + err));

    return () => {
      if (qr.isScanning) qr.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScan(qrToken) {
    setStatus('Got QR code. Getting your location...');
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const { data } = await api.post('/attendance/scan', {
            qrToken,
            lat: latitude,
            lng: longitude,
          });
          setResult({
            ok: true,
            message: data.message,
            event: data.eventTitle,
            distance: data.attendance.distanceFromVenue,
          });
        } catch (err) {
          setResult({ ok: false, message: err.response?.data?.message || 'Could not mark attendance' });
        }
      },
      () => setStatus('Location permission denied — attendance requires location access'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="titles">
          <span className="eyebrow">Attendee</span>
          <h2>Scan Event QR</h2>
        </div>
      </div>
      {!result && (
        <div className="scan-stage">
          <div id="reader" style={{ width: '300px' }} />
          <p className="scan-status">{status}</p>
        </div>
      )}
      {result && (
        <div className={result.ok ? 'success' : 'error'}>
          <p>{result.message}</p>
          {result.ok && (
            <p>
              Event: {result.event} — Distance from venue: {result.distance}m
            </p>
          )}
          <button onClick={() => navigate('/events')}>Back to events</button>
        </div>
      )}
    </div>
  );
}
