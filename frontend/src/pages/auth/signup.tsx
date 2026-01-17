import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { SignupPayload } from "../../features/auth/auth.types";
import { register } from "../../features/auth/auth.slice";

export default function Singup() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isloading, isSuccess, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(error, {
        id: "registred error",
      });
    }
    if (isSuccess || isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [navigate, error, isSuccess, isAuthenticated]);

  const [form, setForm] = useState<SignupPayload>({
    name: "",
    email: "",
    password: "",
  });

  const hanleRegistred = () => {
    if (!form.email || !form.name || !form.password) {
      toast.error("All Fields are Required");

      return;
    }
    dispatch(register(form));
  };

  return (
    <div>
      <input
        value={form.name}
        type="text"
        placeholder="name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        disabled={isloading}
      />

      <input
        value={form.email}
        type="email"
        placeholder="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        disabled={isloading}
      />
      <input
        value={form.password}
        type="password"
        placeholder="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        disabled={isloading}
      />
      <button onClick={hanleRegistred} disabled={isloading}>
        {isloading ? "Registering" : "Register"}
      </button>
    </div>
  );
}
