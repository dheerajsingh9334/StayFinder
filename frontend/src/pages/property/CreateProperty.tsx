import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useEffect, useState } from "react";
import type { CreatePropertyPayload } from "../../features/property/property.types";
import { createProperty } from "../../features/property/property.hooks";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CreateProperty() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isLoading, isSuccess } = useSelector(
    (state: RootState) => state.property,
  );
  const navigate = useNavigate();
  //   const [title, setTitle] = useState<string>("");
  //   const [description, setDescription] = useState<string>("");
  //   const [price, setPrice] = useState<number>(0);
  //   const [state, setState] = useState<string>("delhi");
  //   const [capacity, setCapacity] = useState<number>(1);
  //   const [bedrooms, setBedrooms] = useState<number>(1);
  //   const [bathtrooms, setBathrooms] = useState<number>(1);
  //   const [city, setCity] = useState<string>("Delhi");
  //   const [images, setImage] = useState<string[]>([""]);
  //   const [amenities, setAmenities] = useState<string[]>([""]);
  //   const [lat, setLat] = useState<number>(28.7041);
  //   const [lng, setLng] = useState<number>(77.1025);
  useEffect(() => {
    if (error) {
      toast.error(error, {
        id: "Create-Property",
      });
    }
    if (isSuccess) {
      navigate("/Myproperty", { replace: true });
    }
  }, [error, isSuccess]);
  const [form, setForm] = useState<CreatePropertyPayload>({
    title: "",
    description: "",
    price: 1,
    state: "delhi",
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

  const handleCreate = () => {
    dispatch(createProperty(form));
  };

  return (
    <div>
      <input
        value={form.title}
        type="text"
        placeholder="title"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        disabled={isLoading}
      ></input>
      <textarea
        value={form.description}
        placeholder="description"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        disabled={isLoading}
      ></textarea>
      <input
        value={form.price}
        min={0}
        type="text"
        inputMode="numeric"
        placeholder="Price"
        onChange={(e) =>
          setForm({ ...form, price: parseInt(e.target.value) || 0 })
        }
        disabled={isLoading}
      ></input>
      <input
        value={form.state}
        type="text"
        placeholder="state"
        onChange={(e) => setForm({ ...form, state: e.target.value })}
        disabled={isLoading}
      ></input>
      <input
        value={form.capacity}
        type="text"
        inputMode="numeric"
        min={0}
        placeholder="capacity"
        onChange={(e) =>
          setForm({ ...form, capacity: parseInt(e.target.value) })
        }
        disabled={isLoading}
      ></input>
      <input
        value={form.bedrooms}
        type="text"
        inputMode="numeric"
        placeholder="bedrooms"
        onChange={(e) =>
          setForm({ ...form, bedrooms: parseInt(e.target.value) })
        }
        disabled={isLoading}
      ></input>
      <input
        value={form.bathrooms}
        type="text"
        inputMode="numeric"
        placeholder="bathrooms"
        onChange={(e) =>
          setForm({ ...form, bathrooms: parseInt(e.target.value) })
        }
        disabled={isLoading}
      ></input>
      <input
        value={form.city}
        type="text"
        placeholder="city"
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        disabled={isLoading}
      ></input>
      <input
        value={form.address}
        type="text"
        placeholder="address"
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        disabled={isLoading}
      ></input>
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
        disabled={isLoading}
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
        value={form.lat}
        type="Number"
        placeholder="Lat"
        onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
        disabled={isLoading}
      ></input>
      <input
        value={form.lng}
        type="Number"
        placeholder="Lng"
        onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
        disabled={isLoading}
      ></input>

      <button onClick={handleCreate} disabled={isLoading}>
        {isLoading ? "Creating..." : "CreateProperty"}
      </button>
    </div>
  );
}
