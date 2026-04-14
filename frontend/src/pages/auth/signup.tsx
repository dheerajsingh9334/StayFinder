import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { SignupPayload } from "../../features/auth/auth.types";
import { register } from "../../features/auth/auth.slice";
import { Home, Mail, Lock, User, ArrowRight } from "lucide-react";
import { FeyButton } from "../../components/ui/fey-button";
import Input from "../../components/ui/Input";

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isloading, isSuccess, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const navigate = useNavigate();
  const location = useLocation();

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
        state: { from: location.state?.from },
      });
    } else if (isAuthenticated) {
      const from = location.state?.from || "/profile";
      navigate(from, { replace: true });
    }
  }, [navigate, error, isSuccess, isAuthenticated, form.email, location]);

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
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden p-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none"></div>
      <div className="absolute -top-[500px] -right-[500px] h-[1000px] w-[1000px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-[500px] -left-[500px] h-[1000px] w-[1000px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

      {/* Glossy Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 transform transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-lg backdrop-blur-md mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/20 blur-xl opacity-50"></div>
             <Home size={26} className="text-white relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
          <p className="text-sm text-white/50">Join StayFinder and start exploring</p>
        </div>

        <form className="flex flex-col gap-4 relative z-20" onSubmit={handleRegister}>
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

          <FeyButton
            type="submit"
            className="w-full mt-4 h-12 text-base font-semibold shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow"
            isLoading={isloading}
          >
            Create account <ArrowRight size={18} className="ml-2 inline-block"/>
          </FeyButton>

          <div className="relative my-5 flex items-center justify-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
             <div className="relative flex justify-center text-[10px] font-bold tracking-widest uppercase"><span className="bg-black px-4 text-white/40">OR</span></div>
          </div>

          <a href={`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/auth/google`} className="inline-block w-full" style={{ textDecoration: 'none' }}>
             <button
               type="button"
               className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
             >
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="size-5" />
               Continue with Google
             </button>
          </a>
        </form>

        <p className="text-[11px] text-white/40 text-center mt-6 relative z-20 px-4">
          By signing up, you agree to our{" "}
          <a href="#" className="font-medium text-white/60 hover:text-white transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-white/60 hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>

        <div className="mt-8 text-center text-sm text-white/50 relative z-20">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-white hover:text-white/80 transition-colors ml-1">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
