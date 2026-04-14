'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import createGlobe from 'cobe';
import { MapPin, Star } from 'lucide-react';

interface PulseMarker {
  id: string;
  location: [number, number];
  delay: number;
  tone?: 'default' | 'user';
  href?: string;
  title?: string;
  image?: string;
  price?: number;
  city?: string;
  onClick?: () => void;
}

interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
  onMarkerClick?: (marker: PulseMarker) => void;
}

const defaultMarkers: PulseMarker[] = [
  { id: 'pulse-1', location: [51.51, -0.13], delay: 0 },
  { id: 'pulse-2', location: [40.71, -74.01], delay: 0.5 },
  { id: 'pulse-3', location: [35.68, 139.65], delay: 1 },
  { id: 'pulse-4', location: [-33.87, 151.21], delay: 1.5 },
];

export function GlobePulse({
  markers = defaultMarkers,
  className = '',
  speed = 0.003,
  onMarkerClick,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 1,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [0.5, 0.5, 0.5],
        markerColor: [0.2, 0.8, 0.9],
        glowColor: [0.05, 0.05, 0.05],
        markerElevation: 0,
        markers: markers.map((marker) => ({
          location: marker.location,
          size: 0.025,
          id: marker.id,
        })),
        arcs: [],
        arcColor: [0.3, 0.85, 0.95],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      });

      function animate() {
        if (!isPausedRef.current) phi += speed;

        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });

        animationId = requestAnimationFrame(animate);
      }

      animate();
      setTimeout(() => canvas && (canvas.style.opacity = '1'));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });

      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed]);

  const hoveredMarker = markers.find((m) => m.id === hoveredId);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scaleX(0.3) scaleY(0.3); opacity: 0.8; }
          100% { transform: scaleX(1.5) scaleY(1.5); opacity: 0; }
        }
        @keyframes globe-tooltip-in {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
          opacity: 0,
          transition: 'opacity 1.2s ease',
          borderRadius: '50%',
          touchAction: 'none',
        }}
      />
      {markers.map((marker) => (
        <div
          key={marker.id}
          onMouseEnter={() => {
            // Only show tooltip for real property markers that have a title
            if (marker.id !== 'user-location' && marker.title) {
              setHoveredId(marker.id);
            }
          }}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => {
            if (marker.onClick) {
              marker.onClick();
            } else if (onMarkerClick) {
              onMarkerClick(marker);
            }
          }}
          style={{
            position: 'absolute',
            positionAnchor: `--cobe-${marker.id}`,
            bottom: 'anchor(center)',
            left: 'anchor(center)',
            translate: '-50% 50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents:
              marker.href || marker.onClick || marker.title ? 'auto' : ('none' as const),
            opacity: `var(--cobe-visible-${marker.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${marker.id}, 0)) * 8px))`,
            transition: 'opacity 0.4s, filter 0.4s',
            cursor: marker.href || marker.onClick ? 'pointer' : 'default',
            zIndex: hoveredId === marker.id ? 50 : 10,
          }}
        >
          {/* Hover property card — shown above the dot */}
          {hoveredId === marker.id && marker.title && marker.id !== 'user-location' && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 200,
                background: 'rgba(10,10,14,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                padding: 0,
                pointerEvents: 'none',
                animation: 'globe-tooltip-in 0.18s ease both',
                zIndex: 60,
                overflow: 'hidden',
              }}
            >
              {/* Property image */}
              {marker.image && (
                <div style={{ width: '100%', height: 110, overflow: 'hidden' }}>
                  <img
                    src={marker.image}
                    alt={marker.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              )}
              {/* Card body */}
              <div style={{ padding: '10px 12px' }}>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#f1f5f9',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {marker.title}
                </p>
                {marker.city && (
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: 11,
                      color: 'rgba(148,163,184,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <MapPin style={{ width: 10, height: 10, flexShrink: 0 }} />
                    {marker.city}
                  </p>
                )}
                {marker.price !== undefined && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#34d4e0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Star style={{ width: 11, height: 11, flexShrink: 0 }} />
                    ₹{Number(marker.price).toLocaleString()}
                    <span style={{ fontWeight: 400, color: 'rgba(148,163,184,0.7)', fontSize: 10 }}>
                      / night
                    </span>
                  </p>
                )}
              </div>
              {/* Arrow pointer */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 10,
                  height: 6,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '6px solid rgba(10,10,14,0.95)',
                }}
              />
            </div>
          )}

          {/* User-location label */}
          {marker.id === 'user-location' && hoveredId === marker.id && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10,10,14,0.9)',
                border: '1px solid rgba(125,211,252,0.3)',
                padding: '4px 10px',
                fontSize: 11,
                color: '#7dd3fc',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                animation: 'globe-tooltip-in 0.18s ease both',
              }}
            >
              Your location
            </div>
          )}

          {/* Dot + pulse rings */}
          {(() => {
            const isUserMarker = marker.tone === 'user';
            const accent = isUserMarker ? '#7dd3fc' : '#33ccdd';
            const outerBorder = isUserMarker
              ? 'rgba(125, 211, 252, 0.9)'
              : '#33ccdd';
            const outerGlow = isUserMarker
              ? '0 0 0 3px #07111d, 0 0 0 6px rgba(125, 211, 252, 0.95)'
              : '0 0 0 3px #111, 0 0 0 5px #33ccdd';

            return (
              <>
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: `2px solid ${outerBorder}`,
                    borderRadius: '50%',
                    opacity: 0,
                    animation: `pulse-expand 2s ease-out infinite ${marker.delay}s`,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: `2px solid ${outerBorder}`,
                    borderRadius: '50%',
                    opacity: 0,
                    animation: `pulse-expand 2s ease-out infinite ${marker.delay + 0.5}s`,
                  }}
                />
                <span
                  style={{
                    width: isUserMarker ? 12 : 10,
                    height: isUserMarker ? 12 : 10,
                    background: accent,
                    borderRadius: '50%',
                    boxShadow: hoveredId === marker.id && !isUserMarker
                      ? `${outerGlow}, 0 0 12px ${accent}`
                      : outerGlow,
                    transition: 'box-shadow 0.2s',
                  }}
                />
              </>
            );
          })()}
        </div>
      ))}

      {/* "Hovering X properties" count overlay */}
      {hoveredMarker && hoveredMarker.id !== 'user-location' && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 11,
            color: 'rgba(148,163,184,0.7)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Click to view property
        </div>
      )}
    </div>
  );
}
