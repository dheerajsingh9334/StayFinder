import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { updateProfile } from "../../features/auth/auth.slice";

export default function UpdateProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { isloading } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleUpdate = () => {
    dispatch(
      updateProfile({
        name,
        phone,
      })
    );
  };

  if (isloading) return <div>Loading...</div>;
  return (
    <div>
      <h2>Update Profile</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={handleUpdate}>update</button>
    </div>
  );
}
