type LocalNotification = {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "message" | "review" | "system";
  isRead: boolean;
  createdAt: string;
};

const KEY = "stayfinder_notifications";

const readAll = (): LocalNotification[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (items: LocalNotification[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const notificationsService = {
  getNotifications: async (page = 1, limit = 20) => {
    const all = readAll();
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);
    return { data: { data, total: all.length, page, limit } };
  },

  getUnreadCount: async () => {
    const all = readAll();
    const unread = all.filter((n) => !n.isRead).length;
    return { data: { unread } };
  },

  markAsRead: async (notificationId: string) => {
    const all = readAll().map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n,
    );
    writeAll(all);
    return { data: { ok: true } };
  },

  markAllAsRead: async () => {
    const all = readAll().map((n) => ({ ...n, isRead: true }));
    writeAll(all);
    return { data: { ok: true } };
  },

  deleteNotification: async (notificationId: string) => {
    const all = readAll().filter((n) => n.id !== notificationId);
    writeAll(all);
    return { data: { ok: true } };
  },

  deleteAllNotifications: async () => {
    writeAll([]);
    return { data: { ok: true } };
  },

  subscribeToNotifications: async () => ({ data: { ok: true } }),
};
