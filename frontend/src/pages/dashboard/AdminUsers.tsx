import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";
import { User, CheckCircle, Ban, AlertTriangle } from "lucide-react";
import Button from "../../components/ui/Button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id: string, currentBanStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/ban`);
      setUsers(users.map(u => u.id === id ? { ...u, isBanned: !currentBanStatus } : u));
      toast.success(currentBanStatus ? "User unbanned" : "User banned");
    } catch {
      toast.error("Failed to update ban status");
    }
  };

  const verifyUser = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/verify`);
      setUsers(users.map(u => u.id === id ? { ...u, isEmailVerified: true } : u));
      toast.success("User verified manually");
    } catch {
      toast.error("Failed to verify user");
    }
  };

  if (loading) return <Loader size="lg" text="Loading users..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
      </div>
      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ textAlign: "left", padding: "12px" }}>User</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Role</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ padding: "8px", background: "var(--gray-100)", borderRadius: "var(--radius-full)" }}>
                      <User size={16} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 500 }}>{u.name}</p>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px" }}>
                  {u.isBanned ? (
                    <span style={{ color: "var(--error)", display: "flex", alignItems: "center", gap: "4px" }}><Ban size={14}/> Banned</span>
                  ) : u.isEmailVerified ? (
                    <span style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle size={14}/> Verified</span>
                  ) : (
                    <span style={{ color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "4px" }}><AlertTriangle size={14}/> Unverified</span>
                  )}
                </td>
                <td style={{ padding: "12px" }}>
                  <span className="badge badge-primary">{u.role}</span>
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button variant={u.isBanned ? "primary" : "outline"} onClick={() => toggleBan(u.id, u.isBanned)}>
                      {u.isBanned ? "Unban" : "Ban"}
                    </Button>
                    {!u.isEmailVerified && (
                      <Button variant="secondary" onClick={() => verifyUser(u.id)}>Verify</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
