import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import type { ChangePasswordPayload } from "../../features/auth/auth.types";
import toast from "react-hot-toast";
import { changePassword, resetAuthFlags } from "../../features/auth/auth.slice";

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

  useEffect(() => {
    if (error)
      toast.error(error, {
        id: "CHangePasswordErroe",
      });
    dispatch(resetAuthFlags());
  }, [error, dispatch]);

  useEffect(() => {
    if (isSuccess) navigate("/login", { replace: true });
    dispatch(resetAuthFlags());
  }, [isSuccess, navigate, dispatch]);

  const handleSubmit = () => {
    if (!form.oldPassword || !form.newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (form.newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(changePassword(form));
  };

  return (
    <div>
      <input
        value={form.oldPassword}
        type="text"
        placeholder="oldPassword"
        onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        disabled={isloading}
      />
      <input
        value={form.newPassword}
        type="text"
        placeholder="newPassword"
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        disabled={isloading}
      />
      <input
        value={confirmPassword}
        type="text"
        placeholder="confirmPassword"
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isloading}
      />

      <button onClick={handleSubmit} disabled={isloading}>
        {" "}
        {isloading ? "Changing" : "Change Password"}
      </button>
    </div>
  );
}
