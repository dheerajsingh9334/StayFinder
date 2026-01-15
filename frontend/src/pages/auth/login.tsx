import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { login } from "../../features/auth/auth.slice";
import toast from "react-hot-toast";
import type { LoginPayload } from "../../features/auth/auth.types";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isloading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        id: "Auth only",
      });
    }
  }, [error]);

  const [form, setForm] = useState<LoginPayload>({
    email: "user@gmail.com",
    password: "123456",
  });
  // const [email, setEmail] = useState("user@gmail.com");
  // const [password, setPassword] = useState("123456");

  const handleLogin = () => {
    dispatch(login(form));
  };

  return (
    <div>
      <input
        value={form.email}
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
      <button onClick={handleLogin} disabled={isloading}>
        {isloading ? "loggin in" : "Login"}
      </button>
    </div>
  );
}
