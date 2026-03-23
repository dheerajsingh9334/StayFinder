import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { SignupPayload } from "../../features/auth/auth.types";
import { register } from "../../features/auth/auth.slice";
import { Home, Mail, Lock, User, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isloading, isSuccess, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupPayload>({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error, { id: "registred error" });
    }
    if (isSuccess) {
      navigate(`/otp-verification?email=${encodeURIComponent(form.email)}`, {
        replace: true,
      });
    } else if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [navigate, error, isSuccess, isAuthenticated, form.email]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    dispatch(register(form));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Home size={32} />
          </div>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join StayFinder and start exploring</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <Input
            type="text"
            label="Full name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={isloading}
            leftIcon={<User size={18} />}
          />

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
            placeholder="Create a password"
            hint="Must be at least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isloading}
            leftIcon={<Lock size={18} />}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isloading}
            rightIcon={<ArrowRight size={18} />}
          >
            Create account
          </Button>
        </form>

        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--gray-500)",
            textAlign: "center",
            marginTop: "var(--space-4)",
          }}
        >
          By signing up, you agree to our{" "}
          <a href="#" className="auth-link">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="auth-link">
            Privacy Policy
          </a>
        </p>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
