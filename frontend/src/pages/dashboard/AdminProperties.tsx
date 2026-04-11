import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";
import { Building2, Check, X } from "lucide-react";
import Button from "../../components/ui/Button";

interface AdminProperty {
  id: string;
  title: string;
  status: string;
  price: number;
}

export default function AdminProperties() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/property?page=1&limit=100"); // getting high limit for admin
      setProperties(data.data || []);
    } catch {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status });
      setProperties(properties.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`Property marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <Loader size="lg" text="Loading properties..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manage Properties</h1>
      </div>
      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ textAlign: "left", padding: "12px" }}>Property</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Price</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ padding: "8px", background: "var(--gray-100)", borderRadius: "var(--radius-full)" }}>
                      <Building2 size={16} />
                    </div>
                    <span style={{ fontWeight: 500 }}>{p.title}</span>
                  </div>
                </td>
                <td style={{ padding: "12px", fontWeight: 500 }}>₹{p.price}</td>
                <td style={{ padding: "12px" }}>
                  <span className={`badge ${p.status === "ACTIVE" ? "badge-primary" : p.status === "REJECTED" ? "badge-outline" : "badge-secondary"}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {p.status !== "ACTIVE" && (
                      <Button variant="outline" onClick={() => updateStatus(p.id, "ACTIVE")} leftIcon={<Check size={14}/>}>
                        Approve
                      </Button>
                    )}
                    {p.status !== "REJECTED" && (
                      <Button variant="secondary" onClick={() => updateStatus(p.id, "REJECTED")} leftIcon={<X size={14}/>}>
                        Reject
                      </Button>
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
