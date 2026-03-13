import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader } from "../../components/ui/Loader";
import { Mail, ArrowLeft, KeyRound, Send, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - replace with actual API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success("Password reset link sent!");
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--success)"
          }}>
            <CheckCircle size={40} />
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Check Your Email
          </h1>
          
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            We've sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>. 
            Please check your inbox and follow the instructions.
          </p>

          <div style={{ 
            padding: "1rem", 
            backgroundColor: "var(--bg-secondary)", 
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)"
          }}>
            Didn't receive the email? Check your spam folder or try again.
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => setIsSubmitted(false)}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            Try Different Email
          </button>

          <Link 
            to="/login"
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--primary)",
              fontSize: "0.875rem",
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-xl)",
            background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            color: "white"
          }}>
            <KeyRound size={32} />
          </div>
          
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Forgot Password?
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">
              <Mail size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !email.trim()}
            style={{ width: "100%", marginBottom: "1.5rem" }}
          >
            {isLoading ? (
              <>
                <Loader size="sm" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: "center" }}>
          <Link 
            to="/login"
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--primary)",
              fontSize: "0.875rem",
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}