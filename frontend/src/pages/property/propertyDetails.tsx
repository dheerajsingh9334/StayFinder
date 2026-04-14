import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import type { UpdatePropertyPayload } from '../../features/property/property.types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  useUpdateProperty,
  usePropertyDetails,
} from '../../features/property/property.hooks';
import CalendarView from '../availbility/CalenderView';
import MapView from '../map/MapView';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Edit2,
  Wifi,
  Car,
  Wind,
  UtensilsCrossed,
  Check,
  ChevronLeft,
  Home,
  MessageCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import PropertyReviews from '../../components/property/PropertyReviews';
import { StarButton } from '@/components/ui/star-button';
import { useFavorites, useToggleFavorite } from '../../features/favorites/favorites.hooks';
import { Heart } from 'lucide-react';
import { FeyButton } from '../../components/ui/fey-button';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={18} />,
  ac: <Wind size={18} />,
  parking: <Car size={18} />,
  kitchen: <UtensilsCrossed size={18} />,
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { data: current, isLoading, isError, error } = usePropertyDetails(id!);
  const updateProperty = useUpdateProperty();
  const userlocation = useLiveLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdatePropertyPayload | null>(null);
  const { data: favoriteList } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const isFavorite = current ? (favoriteList?.has(current.id) ?? false) : false;

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"overview" | "amenities" | "host" | "edit">("overview");
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("prop-hero3-animations")) return;
    const style = document.createElement("style");
    style.id = "prop-hero3-animations";
    style.innerHTML = `
      @keyframes hero3-intro {
        0% { opacity: 0; transform: translate3d(0, 64px, 0) scale(0.98); filter: blur(12px); }
        60% { filter: blur(0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
      }
      @keyframes hero3-glow {
        0%, 100% { opacity: 0.45; transform: translate3d(0,0,0); }
        50% { opacity: 0.9; transform: translate3d(0,-8px,0); }
      }
      @keyframes hero3-drift {
        0%, 100% { transform: translate3d(0,0,0) rotate(-3deg); }
        50% { transform: translate3d(0,-12px,0) rotate(3deg); }
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) {
      setVisible(true);
      return;
    }
    const node = sectionRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (isLoading || !current) {
    return <Loader size="lg" text="Loading property details..." />;
  }

  const parseCoordinate = (value: unknown) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const isOwner = user?.id === current.owner?.id;
  const propertyLat = parseCoordinate(current.lat);
  const propertyLng = parseCoordinate(current.lng);
  const hasPropertyCoordinates = propertyLat !== null && propertyLng !== null;
  const mainImage =
    current.images?.[0] ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

  const handleEditStart = () => {
    setForm({
      title: current.title,
      description: current.description,
      price: current.price,
      state: current.state,
      city: current.city,
      capacity: current.capacity,
      bedrooms: current.bedrooms,
      bathrooms: current.bathrooms,
      images: current.images ?? [],
      amenities: current.amenities ?? [],
      lat: current.lat ?? undefined,
      lng: current.lng ?? undefined,
      address: current.address ?? undefined,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!id || !form) return;
    updateProperty.mutate(
      { id, data: form },
      {
        onSuccess: () => {
          toast.success('Property updated successfully');
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm(null);
  };

  const toggleAmenity = (amenity: string) => {
    if (!form) return;
    setForm({
      ...form,
      amenities: form.amenities?.includes(amenity)
        ? form.amenities.filter((a) => a !== amenity)
        : [...(form.amenities ?? []), amenity],
    });
  };

  const Amenities = [
    'wifi',
    'ac',
    'parking',
    'kitchen',
    'tissue',
    'fresh-pillow',
    'fresh-flowers',
  ] as const;

  


  const palette = {
    surface: "bg-black text-white",
    subtle: "text-white/60",
    border: "border-white/10",
    card: "bg-black",
    accent: "bg-transparent/5",
    glow: "rgba(255,255,255,0.14)",
    background: { color: "#000000" },
  };

  const setSpotlight = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--hero3-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--hero3-y", `${event.clientY - rect.top}px`);
  };

  const clearSpotlight = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.style.removeProperty("--hero3-x");
    target.style.removeProperty("--hero3-y");
  };

const handleBook = () => {
    setIsReserving(true);
    setTimeout(() => {
      navigate(`/booking/new?propertyId=${current.id}`);
    }, 400);
  };

  return (
    <div className={`relative isolate min-h-screen w-full transition-colors duration-700 ${palette.surface} overflow-x-hidden`}>
      <button onClick={() => navigate(-1)} className="absolute top-4 left-6 z-50 btn btn-ghost text-white/70 hover:text-white">
        <ChevronLeft size={20} className="mr-2" /> Back
      </button>

      <div className="pointer-events-none absolute inset-0 -z-30" style={{ backgroundColor: palette.background.color }} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/50" />

      <section ref={sectionRef} className={`relative flex min-h-screen w-full flex-col gap-16 px-6 py-24 transition-opacity duration-700 md:gap-20 md:px-10 lg:px-16 xl:px-24 ${visible ? "motion-safe:animate-[hero3-intro_1s_cubic-bezier(.22,.68,0,1)_forwards]" : "opacity-0"}`}>
        
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-end z-10 relative">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 border px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.4em] ${palette.border} ${palette.accent}`}>
                Property Core
              </span>
              <button 
                onClick={() => toggleFavorite({ propertyId: current.id, isFavorite })}
                className={`ml-auto flex items-center justify-center p-2.5 transition border disabled:opacity-50 ${isFavorite ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
                {current.title}
              </h1>
              <p className={`flex items-center gap-2 max-w-2xl text-base md:text-lg ${palette.subtle}`}>
                <MapPin size={18} />
                {current.address || current.city || "Location unavailable"}{current.state ? `, ${current.state}` : ''}{current.country ? `, ${current.country}` : ''}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className={`inline-flex flex-wrap gap-3 border px-5 py-3 text-xs uppercase tracking-[0.3em] transition ${palette.border} ${palette.accent}`}>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live verification
                </span>
                <span className="opacity-60">∙</span>
                <span className="flex items-center gap-2 text-amber-400">
                  <Star size={14} fill="currentColor" /> {current.averageRating > 0 ? current.averageRating.toFixed(1) : "New"}
                </span>
              </div>
              <div className={`flex divide-x divide-white/10 overflow-hidden border text-xs uppercase tracking-[0.35em] ${palette.border}`}>
                <div className="flex flex-col px-5 py-3">
                  <span className={`text-[11px] ${palette.subtle}`}>Capacity</span>
                  <span className="text-lg font-semibold tracking-tight">{current.capacity}</span>
                </div>
                <div className="flex flex-col px-5 py-3">
                  <span className={`text-[11px] ${palette.subtle}`}>Beds</span>
                  <span className="text-lg font-semibold tracking-tight">{current.bedrooms}</span>
                </div>
                <div className="flex flex-col px-5 py-3">
                  <span className={`text-[11px] ${palette.subtle}`}>Baths</span>
                  <span className="text-lg font-semibold tracking-tight">{current.bathrooms}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`relative flex flex-col gap-6 border p-8 transition ${palette.border} ${palette.card}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em]">Data Feed</p>
                <h2 className="text-xl font-semibold tracking-tight">{mode === "overview" ? "System overview" : mode === "amenities" ? "Asset features" : mode === "host" ? "Host signal" : "Edit metrics"}</h2>
              </div>
              <Home size={32} strokeWidth={1} className="text-white/20" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => setMode("overview")} className={`flex-1 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${mode === "overview" ? "bg-white text-black" : palette.border + " " + palette.accent}`}>Overview</button>
              <button type="button" onClick={() => setMode("amenities")} className={`flex-1 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${mode === "amenities" ? "bg-white text-black" : palette.border + " " + palette.accent}`}>Amenities</button>
              <button type="button" onClick={() => setMode("host")} className={`flex-1 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${mode === "host" ? "bg-white text-black" : palette.border + " " + palette.accent}`}>Host</button>
              {isOwner && (
                <button type="button" onClick={() => { setMode("edit"); handleEditStart(); }} className={`flex-1 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${mode === "edit" ? "bg-white text-black" : palette.border + " " + palette.accent}`}><Edit2 size={12} className="inline mr-2" />Edit</button>
              )}
            </div>

            <div className="mt-4 min-h-[150px]">
              {mode === "overview" && (
                <p className={`text-sm leading-relaxed ${palette.subtle}`}>{current.description}</p>
              )}
              {mode === "amenities" && (
                <ul className="grid grid-cols-2 gap-4 text-sm">
                  {current.amenities?.map((amenity, i) => (
                    <li key={i} className={`flex items-center gap-3 ${palette.subtle}`}>
                      <span className="text-white/60">{amenityIcons[amenity.toLowerCase()] || <Check size={18} />}</span>
                      <span className="capitalize">{amenity}</span>
                    </li>
                  ))}
                </ul>
              )}
              {mode === "host" && (
                <div className="flex items-center gap-4 border border-white/10 p-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-bold">
                    {current.owner?.avatarUrl ? <img src={current.owner.avatarUrl} alt={current.owner.name} className="w-full h-full object-cover" /> : (current.owner?.name?.charAt(0).toUpperCase() || 'H')}
                  </div>
                  <div>
                    <h4 className="font-semibold">{current.owner?.name || "Host"}</h4>
                    {current.owner?.phone && <p className="text-white/60 text-sm">Contact: {current.owner.phone}</p>}
                  </div>
                </div>
              )}
              {mode === "edit" && form && (
                <div className="flex flex-col gap-4 text-white">
                  <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <div className="flex gap-4">
                    <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                    <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                  </div>
                  <div className="flex gap-4">
                    <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  </div>
                  <Input label="Image URLs" placeholder="Comma separated URLs" value={form.images?.join(", ") || ""} onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map(url => url.trim()).filter(Boolean) })} />
                  <div className="flex gap-4">
                    <Input label="Latitude" type="number" step="any" value={form.lat || ''} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} />
                    <Input label="Longitude" type="number" step="any" value={form.lng || ''} onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })} />
                  </div>
                  <div className="flex gap-3 mt-4">
                     <Button onClick={handleSave} isLoading={updateProperty.isPending}>Save</Button>
                     <Button variant="secondary" onClick={() => { handleCancel(); setMode("overview"); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] xl:items-stretch z-10 relative">
          
          <div className="order-2 flex flex-col gap-6 xl:order-1">
            {/* Small Image Card */}
            <div className={`flex flex-col gap-4 border p-5 transition ${palette.border} ${palette.card}`}>
              <figure className="overflow-hidden relative w-full aspect-[4/3]">
                <img
                  src={mainImage}
                  alt={current.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out hover:scale-[1.03]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 mix-blend-soft-light" />
                <div className="pointer-events-none absolute inset-0 border border-white/10 mix-blend-overlay" />
              </figure>
              <div className={`flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.35em] ${palette.subtle}`}>
                <span>Visual registry</span>
                <span className="flex items-center gap-2">
                  {current.images && current.images.length > 1 ? `+${current.images.length - 1}` : "Primary"}
                </span>
              </div>
            </div>

            {/* Calendar Block */}
            <div className={`flex flex-col gap-6 border p-6 transition flex-1 ${palette.border} ${palette.card}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.35em]">Calendar</h3>
              </div>
              <div className="w-full flex flex-col justify-center min-h-[420px]">
                  <CalendarView propertyId={id!} />
              </div>
            </div>
          </div>

          {/* Large Map Overlay */}
          <div className="order-1 flex flex-col overflow-hidden border transition xl:order-2 bg-white/5 border-white/10 min-h-[500px] relative">
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <h3 className="text-xs uppercase tracking-[0.35em] text-white">Local Map Overlay</h3>
              <span className="text-xs uppercase tracking-[0.35em] text-white/60">Telemetry</span>
            </div>
            <div className="flex-1 w-full h-full relative z-0">
              {hasPropertyCoordinates ? (
                <MapView
                      properties={[ { id: current.id, title: current.title, price: current.price, state: current.state, city: current.city, lat: propertyLat ?? null, lng: propertyLng ?? null, images: current.images ?? [], averageRating: current.averageRating ?? 0, availability: current.availability ?? [], } ]}
                      userLat={userlocation?.lat} userLng={userlocation?.lng}
                      focusLat={propertyLat ?? undefined} focusLng={propertyLng ?? undefined}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xs text-white/40 uppercase tracking-widest text-center">No telemetry data</div>
              )}
            </div>
          </div>

          <aside className="order-3 flex flex-col gap-6 xl:order-3">
            <div className={`sticky top-24 border p-6 transition ${palette.border} ${palette.card} shadow-xl`}>
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-3xl font-bold">₹{current.price.toLocaleString()} <span className="text-base text-white/60 font-normal">night</span></h4>
                </div>
                
                <div className="border border-white/10 overflow-hidden mt-1">
                   <div className="flex flex-col p-4 border-b border-white/10 bg-white/5">
                     <div className="text-xs font-bold uppercase text-white/80 mb-1">Check-in & Checkout</div>
                     <div className="text-sm text-white/60">Select precise dates in booking flow</div>
                   </div>
                   <div className="flex flex-col p-4 bg-white/5">
                     <div className="text-xs font-bold uppercase text-white/80 mb-1">Guests</div>
                     <div className="text-sm text-white/60">Limit: {current.capacity} guests max</div>
                   </div>
                </div>

                <div className="mt-2 text-white">
                  {isOwner ? (
                    <Button className="w-full disabled bg-white/10 text-white/50 cursor-not-allowed">You own this property</Button>
                  ) : (
                    <>
                      <FeyButton 
                        className="w-full mt-3 h-12 text-base"
                        onClick={() => {
                          if (!user) {
                            navigate('/login', { state: { from: `/properties/${current.id}` } });
                          } else {
                            handleBook();
                          }
                        }} 
                        isLoading={isReserving}
                      >
                        Reserve
                      </FeyButton>
                      {user && (
                        <button
                          className="w-full mt-3 flex items-center justify-center gap-2 border border-white/20 bg-white/5 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                          onClick={() => navigate(`/messages?userId=${current.ownerId ?? ''}`)}
                        >
                          <MessageCircle size={16} /> Chat with Host
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="text-center text-sm text-white/60 mt-1">
                  You won't be charged yet
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Global Footer (Reviews Grid Overlay) */}
        <div className="mt-6 z-10 block max-w-7xl mx-auto w-full">
            <h3 className="text-xs uppercase tracking-[0.35em] mb-4 text-white/60">Community Signal Array</h3>
            <div className="border border-white/10 bg-black/40 p-6">
                <PropertyReviews propertyId={current.id} isOwner={isOwner} />
            </div>
        </div>

      </section>
    </div>
  );
}
