import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { UpdatePropertyPayload } from "../../features/property/property.types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  useUpdateProperty,
  usePropertyDetails,
} from "../../features/property/property.hooks";
import CalendarView from "../availbility/CalenderView";
import MapView from "./MapView";
import { useLiveLocation } from "../../hooks/useLiveLocation";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();

  const { user } = useSelector((state: RootState) => state.auth);

  const { data: current, isLoading, isError, error } = usePropertyDetails(id!);
  const updateProperty = useUpdateProperty();
  const userlocation = useLiveLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdatePropertyPayload | null>(null);

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  if (isLoading || !current) return <div>Loading...</div>;

  const isOwner = user?.id === current.owner?.id;

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
          toast.success("Property updated");
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
    "wifi",
    "ac",
    "parking",
    "kitchen",
    "tissue",
    "fresh-pillow",
    "fresh-flowers",
  ] as const;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "24px",
      }}
    >
      <div style={{ flex: 2, paddingLeft: "24px" }}>
        <h2>Property Details</h2>

        {isOwner && !isEditing && (
          <button onClick={handleEditStart}>Edit ✏️</button>
        )}

        {!isEditing ? (
          <>
            <p>Title: {current.title}</p>
            <p>Description: {current.description}</p>
            <p>Price: {current.price}</p>
            <p>Address: {current.address}</p>
            <p>City: {current.city}</p>
            <p>Country: {current.country}</p>
            <p>Capacity: {current.capacity}</p>

            <p>Images:</p>
            <ul>
              {current.images?.map((img, i) => (
                <li key={i}>{img}</li>
              ))}
            </ul>

            <p>Status: {current.status}</p>

            <p>Amenities:</p>
            <ul>
              {current.amenities?.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>

            <p>Rating: {current.averageRating}</p>
            <p>Reviews: {current.reviewCount}</p>

            <h3>Host</h3>
            <p>Name: {current.owner?.name}</p>
            <p>Phone: {current.owner?.phone}</p>
          </>
        ) : (
          form && (
            <>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />

              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              <input
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: Number(e.target.value) })
                }
              />

              <div>
                {Amenities.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    style={{
                      margin: 4,
                      background: form.amenities?.includes(a)
                        ? "green"
                        : "gray",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <button onClick={handleSave} disabled={updateProperty.isPending}>
                Save
              </button>
              <button onClick={handleCancel}>Cancel</button>
            </>
          )
        )}
      </div>
      <div
        style={{ flex: 1, position: "sticky", top: 20, paddingRight: "25px" }}
      >
        <CalendarView propertyId={id!} />
        <MapView
          properties={[
            {
              id: current.id,
              title: current.title,
              price: current.price,
              state: current.state,
              city: current.city,
              lat: current.lat ?? null,
              lng: current.lng ?? null,
              images: current.images ?? [],
              averageRating: current.averageRating ?? 0,
              availability: current.availability ?? [],
            },
          ]}
          userLat={userlocation?.lat}
          userLng={userlocation?.lng}
        />
      </div>
    </div>
  );
}
