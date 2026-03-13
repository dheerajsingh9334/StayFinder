import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import type { ChangePasswordPayload } from "../../features/auth/auth.types";
import toast from "react-hot-toast";
import { changePassword, resetAuthFlags } from "../../features/auth/auth.slice";
import { Loader } from "../../components/ui/Loader";
import { Lock, KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isloading, isSuccess } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();

  const [form, setForm] = useState<ChangePasswordPayload>({
    oldPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: "ChangePasswordError" });
      dispatch(resetAuthFlags());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Password changed successfully!");
      navigate("/login", { replace: true });
      dispatch(resetAuthFlags());
    }
  }, [isSuccess, navigate, dispatch]);

  const handleSubmit = () => {
    if (!form.oldPassword || !form.newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (form.newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(changePassword(form));
  };

  return (
    <div className="page-container" style={{ maxWidth: "500px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => navigate(-1)}
          style={{ marginBottom: "1rem", marginLeft: "-0.5rem" }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Change Password</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Keep your account secure
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Current Password */}
          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
              Current Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showOld ? "text" : "password"}
                className="form-input"
                placeholder="Enter current password"
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                disabled={isloading}
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  padding: "0.25rem"
                }}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label">
              <KeyRound size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                className="form-input"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                disabled={isloading}
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  padding: "0.25rem"
                }}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="form-hint">Minimum 6 characters</span>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">
              <ShieldCheck size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isloading}
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  padding: "0.25rem"
                }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && form.newPassword !== confirmPassword && (
              <span className="form-error">Passwords do not match</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isloading || !form.oldPassword || !form.newPassword || !confirmPassword}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {isloading ? (
              <>
                <Loader size="sm" />
                Changing Password...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Update Password
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div style={{ 
        marginTop: "1.5rem", 
        padding: "1rem", 
        backgroundColor: "var(--bg-secondary)", 
        borderRadius: "var(--radius-md)",
        fontSize: "0.875rem",
        color: "var(--text-secondary)"
      }}>
        <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
          Password Tips:
        </p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <li>Use a mix of letters, numbers, and symbols</li>
          <li>Avoid using personal information</li>
          <li>Don't reuse passwords from other sites</li>
        </ul>
      </div>
    </div>
  );
}
