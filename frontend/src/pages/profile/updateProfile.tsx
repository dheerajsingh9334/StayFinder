import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { updateProfile } from "../../features/auth/auth.slice";
import { Loader } from "../../components/ui/Loader";
import { User, Phone, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpdateProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isloading, user } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleUpdate = () => {
    if (!name.trim()) return;
    dispatch(updateProfile({ name, phone }));
  };

  return (
    <div className="page-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
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
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Update Profile</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Edit your personal information
        </p>
      </div>

      {/* Form Card */}
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Avatar Preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2.5rem",
              fontWeight: 600
            }}>
              {name ? name.charAt(0).toUpperCase() : <User size={40} />}
            </div>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
              Full Name
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isloading}
            />
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label className="form-label">
              <Phone size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
              Phone Number
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isloading}
            />
            <span className="form-hint">Optional - for booking confirmations</span>
          </div>

          {/* Submit Button */}
          <button 
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={isloading || !name.trim()}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {isloading ? (
              <>
                <Loader size="sm" />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
