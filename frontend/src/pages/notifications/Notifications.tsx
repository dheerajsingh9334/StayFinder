import { useState, useEffect } from "react";
import { Bell, Trash2, Check } from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";
import { notificationsService } from "../../services/notifications.services";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "message" | "review" | "system";
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    booking: "var(--accent-blue)",
    payment: "var(--success)",
    message: "var(--accent-purple)",
    review: "var(--accent-amber)",
    system: "var(--gray-500)",
  };
  return colors[type] || "var(--gray-500)";
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await notificationsService.getNotifications();
      setNotifications(data.data);
    } catch (error: unknown) {
      const err = error as any;
      toast.error(
        err.response?.data?.message || "Failed to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      await notificationsService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
      );
    } catch (error: unknown) {
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (notifId: string) => {
    try {
      await notificationsService.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      toast.success("Notification deleted");
    } catch (error: unknown) {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading notifications..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "center",
          }}
        >
          <Bell size={32} />
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">
              {notifications.filter((n) => !n.isRead).length} unread
            </p>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={32} />
          <h3 className="empty-state-title">No notifications</h3>
          <p className="empty-state-description">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                borderLeft: `4px solid ${getNotificationColor(notif.type)}`,
                opacity: notif.isRead ? 0.7 : 1,
                background: notif.isRead ? "var(--gray-50)" : "var(--white)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontWeight: "600",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    {notif.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--gray-600)",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    {notif.message}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--gray-400)",
                    }}
                  >
                    {new Date(notif.createdAt).toLocaleDateString()} ·{" "}
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "var(--space-2)",
                        color: "var(--accent-blue)",
                      }}
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "var(--space-2)",
                      color: "var(--gray-400)",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
