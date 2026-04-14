import type { NearByProperty } from '../../features/property/property.types';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from '@/components/ui/map';
type props = {
  properties?: NearByProperty[];
  userLat?: number;
  userLng?: number;
  focusLat?: number;
  focusLng?: number;
};

type PropertyMarkerProps = {
  property: NearByProperty;
  propertyLat: number;
  propertyLng: number;
  hasUser: boolean;
  parsedUserLat: number | null;
  parsedUserLng: number | null;
  defaultImage: string;
  getDistanceLabel: (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ) => string;
};

function PropertyMarker({
  property,
  propertyLat,
  propertyLng,
  hasUser,
  parsedUserLat,
  parsedUserLng,
  defaultImage,
  getDistanceLabel,
}: PropertyMarkerProps) {
  const { map } = useMap();

  return (
    <MapMarker
      key={property.id}
      longitude={propertyLng}
      latitude={propertyLat}
      onClick={() => {
        map?.flyTo({
          center: [propertyLng, propertyLat],
          zoom: Math.max(map.getZoom(), 16),
          offset: [0, 110],
          duration: 900,
          essential: true,
        });
      }}
    >
      <MarkerContent>
        <div className="relative flex items-center justify-center">
          <span className="absolute size-10 rounded-full bg-emerald-400/30 blur-[2px]" />
          <img
            src={property.images?.[0] || defaultImage}
            alt={property.title}
            className="relative size-9 rounded-full border-2 border-slate-100 object-cover shadow-[0_0_0_3px_rgba(8,11,18,0.9)]"
          />
        </div>
      </MarkerContent>
      <MarkerPopup className="uber-map-popup">
        <div style={{ width: '240px' }}>
          <img
            src={property.images?.[0] || defaultImage}
            alt={property.title}
            style={{
              width: '100%',
              height: '110px',
              objectFit: 'cover',
              borderRadius: '10px',
              marginBottom: '8px',
            }}
          />
          <strong>{property.title}</strong>
          <p style={{ marginTop: '4px', color: 'var(--chalk-300)' }}>
            ₹{Number(property.price || 0).toLocaleString('en-IN')} / night
          </p>
          <p style={{ marginTop: '4px', color: 'var(--chalk-200)' }}>
            {hasUser && parsedUserLat !== null && parsedUserLng !== null
              ? getDistanceLabel(
                  parsedUserLat,
                  parsedUserLng,
                  propertyLat,
                  propertyLng,
                )
              : 'Distance unavailable'}
          </p>

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              gap: '8px',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                window.location.href = `/booking/new?propertyId=${property.id}`;
              }}
            >
              Book now
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                window.location.href = `/properties/${property.id}`;
              }}
            >
              More
            </button>
          </div>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}

export default function MapView({
  properties = [],
  userLat,
  userLng,
  focusLat,
  focusLng,
}: props) {
  const defaultImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';

  const parseCoordinate = (value: unknown) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const toRad = (value: number) => (value * Math.PI) / 180;

  const getDistanceLabel = (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ) => {
    const earthRadiusKm = 6371;
    const dLat = toRad(toLat - fromLat);
    const dLng = toRad(toLng - fromLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(fromLat)) *
        Math.cos(toRad(toLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = earthRadiusKm * c;

    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m away`;
    }
    return `${distanceKm.toFixed(1)} km away`;
  };

  const parsedFocusLat = parseCoordinate(focusLat);
  const parsedFocusLng = parseCoordinate(focusLng);
  const parsedUserLat = parseCoordinate(userLat);
  const parsedUserLng = parseCoordinate(userLng);

  const hasFocus = parsedFocusLat !== null && parsedFocusLng !== null;
  const hasUser = parsedUserLat !== null && parsedUserLng !== null;

  if (!hasFocus && !hasUser) return null;

  const centerLat = hasFocus ? parsedFocusLat! : parsedUserLat!;
  const centerLng = hasFocus ? parsedFocusLng! : parsedUserLng!;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Map center={[centerLng, centerLat]} zoom={13}>
        <MapControls showZoom showLocate={hasUser} showCompass showFullscreen />
        {hasUser && (
          <MapMarker longitude={parsedUserLng!} latitude={parsedUserLat!}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <span className="absolute size-7 rounded-full bg-cyan-400/30 blur-[1px]" />
                <span className="relative size-4 rounded-full border-2 border-slate-950 bg-cyan-300 shadow-[0_0_0_3px_rgba(8,11,18,0.9)]" />
              </div>
            </MarkerContent>
            <MarkerPopup className="uber-map-popup">You are here</MarkerPopup>
          </MapMarker>
        )}
        {properties.map((p) => {
          const propertyLat = parseCoordinate(p.lat);
          const propertyLng = parseCoordinate(p.lng);

          if (propertyLat === null || propertyLng === null) return null;

          return (
            <PropertyMarker
              key={p.id}
              property={p}
              propertyLat={propertyLat}
              propertyLng={propertyLng}
              hasUser={hasUser}
              parsedUserLat={parsedUserLat}
              parsedUserLng={parsedUserLng}
              defaultImage={defaultImage}
              getDistanceLabel={getDistanceLabel}
            />
          );
        })}
      </Map>
    </div>
  );
}
