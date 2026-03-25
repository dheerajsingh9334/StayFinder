import { useEffect, useState } from "react";
import type { CreatePropertyPayload } from "../../features/property/property.types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateProperty } from "../../features/property/property.hooks";
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Users, 
  Bed, 
  Bath, 
  Image, 
  Wifi, 
  Wind, 
  Car, 
  UtensilsCrossed,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input, { Textarea } from "../../components/ui/Input";

const amenityData = [
  { id: "wifi", label: "WiFi", icon: <Wifi size={20} /> },
  { id: "ac", label: "Air Conditioning", icon: <Wind size={20} /> },
  { id: "Parking", label: "Parking", icon: <Car size={20} /> },
  { id: "kitchen", label: "Kitchen", icon: <UtensilsCrossed size={20} /> },
  { id: "Tissue", label: "Tissue", icon: <Sparkles size={20} /> },
  { id: "Fresh Pillow", label: "Fresh Pillows", icon: <Sparkles size={20} /> },
  { id: "Fresh-Flowers", label: "Fresh Flowers", icon: <Sparkles size={20} /> },
];

export default function CreateProperty() {
  const navigate = useNavigate();
  const createProperty = useCreateProperty();
  const { isPending, isSuccess, isError, error } = createProperty;
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<CreatePropertyPayload>({
    title: "",
    description: "",
    price: 1000,
    state: "",
    capacity: 1,
    bedrooms: 1,
    bathrooms: 1,
    city: "",
    address: "",
    images: [],
    amenities: [],
    lat: 28.7041,
    lng: 77.1025,
  });

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(error.message, { id: "Create-Property" });
    }
    if (isSuccess) {
      toast.success("Property created successfully! 🎉");
      navigate("/Myproperty", { replace: true });
    }
  }, [error, isSuccess, isError, navigate]);

  const toggleAmenity = (amenity: string) => {
    if (form.amenities.includes(amenity)) {
      setForm({ ...form, amenities: form.amenities.filter((a) => a !== amenity) });
    } else {
      setForm({ ...form, amenities: [...form.amenities, amenity] });
    }
  };

  const handleCreate = () => {
    if (!form.title || !form.description || !form.city || !form.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    createProperty.mutate(form);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: "var(--space-4)" }}
      >
        <ChevronLeft size={20} />
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--font-bold)", marginBottom: "var(--space-2)" }}>
          List your property
        </h1>
        <p style={{ color: "var(--gray-500)" }}>
          Share your space with travelers from around the world
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "var(--space-8)",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50px",
          right: "50px",
          height: "2px",
          background: "var(--gray-200)"
        }} />
        {[
          { num: 1, label: "Basic Info" },
          { num: 2, label: "Details & Amenities" },
          { num: 3, label: "Location & Images" }
        ].map(({ num, label }) => (
          <div key={num} style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            position: "relative",
            zIndex: 1
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-full)",
              background: step >= num ? "var(--primary-500)" : "var(--gray-200)",
              color: step >= num ? "var(--white)" : "var(--gray-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "var(--font-semibold)",
              marginBottom: "var(--space-2)"
            }}>
              {step > num ? <Check size={20} /> : num}
            </div>
            <span style={{ 
              fontSize: "var(--text-sm)", 
              color: step >= num ? "var(--gray-50)" : "var(--gray-500)",
              fontWeight: step === num ? "var(--font-medium)" : "var(--font-normal)"
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="card">
        <div className="card-body" style={{ padding: "var(--space-8)" }}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-semibold)", marginBottom: "var(--space-1)" }}>
                  Tell us about your property
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                  Start with the basics - what makes your place special?
                </p>
              </div>

              <Input
                label="Property Title"
                placeholder="e.g., Cozy Mountain Retreat with Lake View"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isPending}
                leftIcon={<Home size={18} />}
              />

              <Textarea
                label="Description"
                placeholder="Describe your property, its unique features, nearby attractions..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isPending}
                style={{ minHeight: "150px" }}
              />

              <Input
                label="Price per night (₹)"
                type="number"
                placeholder="2000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                disabled={isPending}
                leftIcon={<DollarSign size={18} />}
                min={0}
              />
            </div>
          )}

          {/* Step 2: Details & Amenities */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-semibold)", marginBottom: "var(--space-1)" }}>
                  Property Details
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                  Help guests know what to expect
                </p>
              </div>

              <div className="form-row">
                <Input
                  label="Capacity (guests)"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                  disabled={isPending}
                  leftIcon={<Users size={18} />}
                  min={1}
                />
                <Input
                  label="Bedrooms"
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 1 })}
                  disabled={isPending}
                  leftIcon={<Bed size={18} />}
                  min={1}
                />
              </div>

              <Input
                label="Bathrooms"
                type="number"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: parseInt(e.target.value) || 1 })}
                disabled={isPending}
                leftIcon={<Bath size={18} />}
                min={1}
              />

              <div>
                <label className="form-label" style={{ marginBottom: "var(--space-3)", display: "block" }}>
                  Amenities
                </label>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "var(--space-3)"
                }}>
                  {amenityData.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      disabled={isPending}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        padding: "var(--space-3) var(--space-4)",
                        background: form.amenities.includes(amenity.id) ? "var(--primary-50)" : "var(--white)",
                        border: `2px solid ${form.amenities.includes(amenity.id) ? "var(--primary-500)" : "var(--gray-200)"}`,
                        borderRadius: "var(--radius-lg)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                        color: form.amenities.includes(amenity.id) ? "var(--primary-400)" : "var(--gray-300)",
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--font-medium)"
                      }}
                    >
                      {amenity.icon}
                      {amenity.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location & Images */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-semibold)", marginBottom: "var(--space-1)" }}>
                  Location & Photos
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                  Help guests find and visualize your property
                </p>
              </div>

              <Input
                label="Full Address"
                placeholder="123 Main Street, Apartment 4B"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={isPending}
                leftIcon={<MapPin size={18} />}
              />

              <div className="form-row">
                <Input
                  label="City"
                  placeholder="New Delhi"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  disabled={isPending}
                />
                <Input
                  label="State"
                  placeholder="Delhi"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                  disabled={isPending}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                  disabled={isPending}
                />
              </div>

              <Input
                label="Image URLs"
                placeholder="Paste image URLs separated by commas"
                value={form.images.join(", ")}
                onChange={(e) => setForm({
                  ...form,
                  images: e.target.value.split(",").map((url) => url.trim()).filter((url) => url.length > 0)
                })}
                disabled={isPending}
                leftIcon={<Image size={18} />}
                hint="Enter direct links to your property images"
              />

              {form.images.length > 0 && (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "var(--space-2)"
                }}>
                  {form.images.slice(0, 4).map((img, i) => (
                    <div 
                      key={i}
                      style={{
                        height: "80px",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        background: "var(--gray-100)"
                      }}
                    >
                      <img 
                        src={img} 
                        alt={`Preview ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="card-footer" style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={prevStep} leftIcon={<ChevronLeft size={18} />}>
                Previous
              </Button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <Button onClick={nextStep} rightIcon={<ChevronRight size={18} />}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleCreate} isLoading={isPending}>
                Create Property
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
