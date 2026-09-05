import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Keyless OSM raster tiles; darkened via a CSS filter on the tile pane
   (see `.leaflet-tile-pane` in styles.css) so no API key / provider is needed. */
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function makeIcon(variant) {
  if (variant === 'qr') {
    return L.divIcon({
      className: 'gm-icon',
      iconSize: [46, 56],
      iconAnchor: [23, 52],
      html: `
        <span class="gm-qr">
          <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
            <rect width="44" height="44" rx="9" fill="#fff"/>
            <g fill="#000">
              <rect x="7" y="7" width="11" height="11" rx="2"/>
              <rect x="26" y="7" width="11" height="11" rx="2"/>
              <rect x="7" y="26" width="11" height="11" rx="2"/>
              <rect x="24" y="24" width="4.5" height="4.5"/>
              <rect x="32" y="24" width="4.5" height="4.5"/>
              <rect x="24" y="32" width="4.5" height="4.5"/>
              <rect x="32" y="32" width="4.5" height="4.5"/>
              <rect x="28" y="28" width="4.5" height="4.5"/>
            </g>
          </svg>
          <i class="gm-nub"></i>
        </span>`,
    });
  }
  return L.divIcon({
    className: 'gm-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: '<span class="gm-pin"></span>',
  });
}

/**
 * Dark Leaflet map (CARTO dark tiles, no API key). Renders a marker + a
 * geofence circle for the given lat/lng/radius. Purely a visual layer —
 * when `interactive` + `onPick` are set it reports clicked / dragged
 * coordinates back through `onPick(lat, lng)`.
 */
export default function GeoMap({
  lat,
  lng,
  radius = 150,
  interactive = false,
  onPick,
  fallbackCenter = [13.0827, 80.2707],
  fallbackZoom = 12,
  className = '',
  markerVariant = 'pin',
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const centeredRef = useRef(false);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const numLat = Number(lat);
  const numLng = Number(lng);
  const hasPos =
    lat !== '' && lng !== '' && Number.isFinite(numLat) && Number.isFinite(numLng);

  useEffect(() => {
    if (mapRef.current || !elRef.current) return;

    const map = L.map(elRef.current, {
      zoomControl: interactive,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: false,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: false,
      touchZoom: interactive,
    });

    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    map.setView(hasPos ? [numLat, numLng] : fallbackCenter, hasPos ? 16 : fallbackZoom);

    if (interactive) {
      map.on('click', (e) => onPickRef.current && onPickRef.current(e.latlng.lat, e.latlng.lng));
    }

    mapRef.current = map;
    const t = setTimeout(() => map.invalidateSize(), 80);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      centeredRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasPos) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      centeredRef.current = false;
      return;
    }

    const pos = [numLat, numLng];

    if (!markerRef.current) {
      markerRef.current = L.marker(pos, {
        icon: makeIcon(markerVariant),
        draggable: interactive,
        keyboard: false,
      }).addTo(map);
      if (interactive) {
        markerRef.current.on('dragend', () => {
          const p = markerRef.current.getLatLng();
          onPickRef.current && onPickRef.current(p.lat, p.lng);
        });
      }
    } else {
      markerRef.current.setLatLng(pos);
    }

    if (!circleRef.current) {
      circleRef.current = L.circle(pos, {
        radius: Number(radius) || 0,
        color: '#aeb9cc',
        weight: 1,
        opacity: 0.8,
        fillColor: '#aeb9cc',
        fillOpacity: 0.12,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng(pos);
      circleRef.current.setRadius(Number(radius) || 0);
    }

    if (!centeredRef.current) {
      map.setView(pos, 16, { animate: false });
      centeredRef.current = true;
    } else if (!map.getBounds().pad(-0.25).contains(pos)) {
      map.panTo(pos);
    }
  }, [numLat, numLng, radius, hasPos, interactive, markerVariant]);

  return <div ref={elRef} className={`geomap ${className}`.trim()} aria-hidden="true" />;
}
