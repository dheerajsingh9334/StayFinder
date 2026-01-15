import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { useEffect, useState } from "react";
import {
  getSingleProperteis,
  updateProperty,
} from "../../features/property/property.slice";
import type { UpdatePropertyPayload } from "../../features/property/property.types";
import toast from "react-hot-toast";

export default function PropertyDetails() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { current } = useSelector((state: RootState) => state.property.all);
  const { isLoading, error } = useSelector(
    (state: RootState) => state.property
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [form, setForm] = useState<UpdatePropertyPayload | null>(null);
  useEffect(() => {
    if (id) {
      dispatch(getSingleProperteis(id));
    }
  }, [id, dispatch]);

  const handleEditStart = () => {
    if (!current) return;
    setForm({
      title: current.title,
      description: current.description,
      price: current.price,
      state: current.state,
      address: current.address ?? "",
      capacity: current.capacity,
      bedrooms: current.bedrooms,
      bathrooms: current.bathrooms,
      city: current.city,
      images: current.images || [],
      amenities: current.amenities || [],
      lat: current.lat ?? undefined,
      lng: current.lng ?? undefined,
    });
    setIsEditing(true);
  };

  useEffect(() => {
    if (error) {
      toast.error(error, {
        id: "Property error",
      });
    }
  }, [error]);

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   if (!form) return;
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  if (isLoading || !current) return <div>Loading...</div>;
  const isOwner = user?.id === current.owner?.id;

  const Amenities = [
    "wifi",
    "ac",
    "Parking",
    "kitchen",
    "Tissue",
    "Fresh Pillow",
    "Fresh-Flowers",
  ] as const;

  const toggleAmenity = (amenity: string) => {
    if (!form) return;
    if (form.amenities.includes(amenity)) {
      setForm({
        ...form,
        amenities: form.amenities.filter((a) => a !== amenity),
      });
    } else {
      setForm({
        ...form,
        amenities: [...form.amenities, amenity],
      });
    }
  };
  const handleSave = () => {
    if (!id || !form) return;
    dispatch(updateProperty({ id, data: form })).unwrap();
    setIsEditing(false);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setForm(null);
  };

  return (
    <div>
      <h2>Property Details</h2>
      {isOwner && !isEditing && (
        <button onClick={handleEditStart}>Edit ✏️</button>
      )}
      {!isEditing ? (
        <>
          <p> title {current.title}</p>
          <p>desc {current.description}</p>
          <p> price {current.price}</p>
          <p> address{current.address}</p>
          <p> city {current.city}</p>
          <p>country {current.country}</p>
          <p>cap {current.capacity}</p>
          <p>
            images
            {current.images?.map((img, index) => (
              <li key={index}>{img}</li>
            ))}
          </p>
          <p>status {current.status}</p>
          <p>
            amenties
            {current.amenities?.map((a, index) => (
              <li key={index}>{a}</li>
            ))}
          </p>
          <p>rating {current.averageRating}</p>
          <p> count {current.reviewCount}</p>
          <p> Created At {current.createdAt}</p>
          <h3>Host details</h3>
          <p>name: {current.owner?.name}</p>
          <p>phone: {current.owner?.phone}</p>
          <p>avatarUrl: {current.owner?.avatarUrl}</p>
        </>
      ) : (
        isEditing &&
        form && (
          <>
            <input
              name="title"
              value={form?.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            ></input>
            <textarea
              name="description"
              value={form?.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            ></textarea>
            <input
              name="price"
              type="text"
              inputMode="numeric"
              min={0}
              value={form?.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            ></input>
            <textarea
              name="address"
              value={form?.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            ></textarea>
            <input
              name="city"
              value={form?.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            ></input>
            <input
              name="capacity"
              type="text"
              inputMode="numeric"
              min={1}
              value={form?.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: Number(e.target.value) })
              }
            ></input>
            <input
              name="bedrooms"
              type="text"
              inputMode="numeric"
              value={form?.bedrooms}
              onChange={(e) =>
                setForm({ ...form, bedrooms: Number(e.target.value) })
              }
            ></input>
            <input
              name="bathrooms"
              type="text"
              inputMode="numeric"
              min={1}
              value={form?.bathrooms}
              onChange={(e) =>
                setForm({ ...form, bathrooms: Number(e.target.value) })
              }
            ></input>
            <div>
              {Amenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  disabled={isLoading}
                  style={{
                    margin: "4px",
                    background: form.amenities.includes(amenity)
                      ? "green"
                      : "lightgray",
                    color: "white",
                  }}
                >
                  {amenity}
                </button>
              ))}
            </div>
            <input
              value={form.images}
              type="text"
              accept="image/png,image/jpg,image/jpeg,image/svg"
              placeholder="upload Property image"
              multiple
              onChange={(e) =>
                setForm({
                  ...form,
                  images: e.target.value
                    .split(",")
                    .map((url) => url.trim())
                    .filter((url) => url.length > 0),
                })
              }
            ></input>
            <input
              name="lat"
              type="text"
              inputMode="numeric"
              value={form?.lat}
              onChange={(e) =>
                setForm({ ...form, lat: Number(e.target.value) })
              }
            ></input>
            <input
              name="lng"
              type="text"
              inputMode="numeric"
              value={form?.lng}
              onChange={(e) =>
                setForm({ ...form, lng: Number(e.target.value) })
              }
            ></input>

            <button onClick={handleSave} disabled={isLoading}>
              Save
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        )
      )}
    </div>
  );
}
