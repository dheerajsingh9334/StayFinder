import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { login } from "../../features/auth/auth.slice";
import toast from "react-hot-toast";
import type { LoginPayload } from "../../features/auth/auth.types";
import { Home, Mail, Lock, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error, isloading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: "Auth only" });
    }
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [error, isAuthenticated, navigate]);

  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(login(form));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Home size={32} />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to StayFinder</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <Input
            type="email"
            label="Email address"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isloading}
            leftIcon={<Mail size={18} />}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isloading}
            leftIcon={<Lock size={18} />}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link 
              to="/forgot-password" 
              className="auth-link"
              style={{ fontSize: "var(--text-sm)" }}
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isloading}
            rightIcon={<ArrowRight size={18} />}
          >
            Sign in
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
