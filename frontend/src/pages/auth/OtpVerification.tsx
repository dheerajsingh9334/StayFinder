import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MailCheck, RotateCcw, ShieldCheck } from "lucide-react";
import { authService } from "../../services/auth.services";
import { useDispatch } from "react-redux";
import { verifyOtp as verifyOtpThunk } from "../../features/auth/auth.slice";
import type { AppDispatch } from "../../store";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function OtpVerification() {
  const navigate = useNavigate();
  const query = useQuery();
  const dispatch = useDispatch<AppDispatch>();

  const initialEmail = query.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter email first");
      return;
    }

    try {
      setIsSending(true);
      await authService.sendOtp(email.trim());
      setCooldown(30);
      toast.success("OTP sent successfully");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !code.trim()) {
      toast.error("Email and OTP are required");
      return;
    }

    if (code.trim().length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setIsVerifying(true);
      await dispatch(
        verifyOtpThunk({ email: email.trim(), code: code.trim() }),
      ).unwrap();
      toast.success("OTP verified successfully");
      navigate("/", { replace: true });
    } catch {
      toast.error("Invalid OTP, please try again");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={32} />
          </div>
          <h1 className="auth-title">Verify Your Account</h1>
          <p className="auth-subtitle">Enter the OTP sent to your email</p>
        </div>

        <form className="auth-form" onSubmit={handleVerifyOtp}>
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isSending || isVerifying}
          />

          <label className="form-label">OTP Code</label>
          <input
            className="form-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Enter 6 digit OTP"
            maxLength={6}
            disabled={isSending || isVerifying}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isVerifying || isSending}
          >
            <MailCheck size={18} />
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={sendOtp}
            disabled={cooldown > 0 || isSending || isVerifying}
          >
            <RotateCcw size={18} />
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : isSending
                ? "Sending..."
                : "Resend OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
