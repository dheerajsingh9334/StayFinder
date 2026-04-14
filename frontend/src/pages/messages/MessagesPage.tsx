import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../../services/api";
import { io, Socket } from "socket.io-client";
import {
  Send, CheckCircle2, MessageCircle,
  Building2, Search, X, ArrowLeft,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useSearchParams, Link } from "react-router-dom";
import { getBackendUrl } from "../../utils/config";

interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
}

interface ConvUser {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

interface Conversation {
  user: ConvUser;
  lastMessage: string;
  timestamp?: string;
  property?: { id: string; title: string; images?: string[] };
}

function Avatar({ src, name, size = 36 }: { src?: string; name?: string; size?: number }) {
  const initials = name?.charAt(0).toUpperCase() ?? "?";
  return src ? (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#818cf8", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [convSearch, setConvSearch] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.user.id === activeChatId);

  // ---- Socket setup ----
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const backendUrl = getBackendUrl();
    const newSocket = io(backendUrl, { withCredentials: true, auth: { token } });
    setSocket(newSocket);

    newSocket.on("connect_error", (err) => console.warn("Socket error:", err.message));

    newSocket.on("new_message", (data: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id && m.id === data.id)) return prev;
        if (data.senderId === activeChatId || data.receiverId === activeChatId || data.senderId === user?.id) {
          return [...prev, data];
        }
        return prev;
      });
      fetchConversations();
    });

    newSocket.on("typing", (data: { senderId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => ({ ...prev, [data.senderId]: data.isTyping }));
    });

    return () => { newSocket.close(); };
  }, [activeChatId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (targetUserId) { loadChat(targetUserId); setMobileShowChat(true); }
  }, [searchParams]);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/message/conversations");
      setConversations(data.conversations || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const loadChat = async (otherUserId: string) => {
    setActiveChatId(otherUserId);
    setHistoryLoading(true);
    try {
      const { data } = await api.get(`/message/history/${otherUserId}`);
      setMessages(data.messages || []);
    } catch { setMessages([]); } finally { setHistoryLoading(false); }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChatId || !socket) return;
    socket.emit("send_message", { receiverId: activeChatId, content: newMessage });
    setNewMessage("");
    socket.emit("typing", { receiverId: activeChatId, isTyping: false });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket || !activeChatId) return;
    socket.emit("typing", { receiverId: activeChatId, isTyping: e.target.value.length > 0 });
  };

  const filteredConvs = conversations.filter((c) =>
    !convSearch || c.user.name.toLowerCase().includes(convSearch.toLowerCase())
  );

  if (loading) return <Loader size="lg" text="Loading your messages..." />;

  return (
    <div className="chat-page">
      {/* ── Sidebar ── */}
      <aside className={`chat-sidebar${mobileShowChat ? " chat-sidebar-hidden" : ""}`}>
        {/* Header */}
        <div className="chat-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageCircle size={18} color="#818cf8" />
            <span className="chat-sidebar-title">Messages</span>
          </div>
          <span className="chat-count">{conversations.length}</span>
        </div>

        {/* Search */}
        <div className="chat-search-wrap">
          <Search size={14} className="chat-search-icon" />
          <input
            className="chat-search-input"
            placeholder="Search conversations…"
            value={convSearch}
            onChange={(e) => setConvSearch(e.target.value)}
          />
          {convSearch && (
            <button className="chat-search-clear" onClick={() => setConvSearch("")}><X size={13} /></button>
          )}
        </div>

        {/* Conversation list */}
        <div className="chat-conv-list">
          {filteredConvs.length === 0 ? (
            <div className="chat-empty-convs">
              <MessageCircle size={28} style={{ opacity: 0.25, marginBottom: "0.5rem" }} />
              <p>{convSearch ? "No results" : "No conversations yet"}</p>
              {!convSearch && <p className="chat-empty-hint">Click "Message Host" on any property to start.</p>}
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.user.id}
                className={`chat-conv-item${activeChatId === conv.user.id ? " active" : ""}`}
                onClick={() => { loadChat(conv.user.id); setMobileShowChat(true); }}
              >
                <Avatar src={conv.user.avatarUrl} name={conv.user.name} size={40} />
                <div className="chat-conv-meta">
                  <p className="chat-conv-name">{conv.user.name}</p>
                  <p className="chat-conv-last">{conv.lastMessage || "No messages yet"}</p>
                  {conv.property && (
                    <p className="chat-conv-prop">
                      <Building2 size={10} style={{ display: "inline", marginRight: 3 }} />
                      {conv.property.title}
                    </p>
                  )}
                </div>
                {activeChatId === conv.user.id && <span className="chat-conv-dot" />}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat area ── */}
      <main className={`chat-main${mobileShowChat ? " chat-main-active" : ""}`}>
        {activeChatId ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <button
                className="chat-back-btn"
                onClick={() => { setMobileShowChat(false); }}
              >
                <ArrowLeft size={16} />
              </button>
              <Avatar src={activeConv?.user?.avatarUrl} name={activeConv?.user?.name} size={38} />
              <div className="chat-header-meta">
                <span className="chat-header-name">{activeConv?.user?.name ?? "User"}</span>
                {typingUsers[activeChatId] ? (
                  <span className="chat-typing">typing…</span>
                ) : (
                  <span className="chat-online">Online</span>
                )}
              </div>
              {activeConv?.property && (
                <Link to={`/properties/${activeConv.property.id}`} className="chat-prop-badge">
                  <Building2 size={11} />
                  {activeConv.property.title}
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {historyLoading ? (
                <div className="chat-messages-loading">
                  <Loader size="sm" text="Loading history…" />
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-messages-empty">
                  <MessageCircle size={36} style={{ opacity: 0.2, marginBottom: "0.75rem" }} />
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id ?? idx} className={`chat-bubble-wrap${isMe ? " me" : ""}`}>
                      {!isMe && (
                        <Avatar src={activeConv?.user?.avatarUrl} name={activeConv?.user?.name} size={28} />
                      )}
                      <div>
                        <div className={`chat-bubble${isMe ? " chat-bubble-me" : " chat-bubble-them"}`}>
                          {m.content}
                        </div>
                        <div className={`chat-bubble-time${isMe ? " me" : ""}`}>
                          {new Date(m.createdAt ?? new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isMe && <CheckCircle2 size={10} style={{ marginLeft: 3 }} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div className="chat-input-row">
              <input
                ref={inputRef}
                className="chat-input"
                placeholder="Type a message…"
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <button
                className={`chat-send-btn${newMessage.trim() ? " active" : ""}`}
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="chat-no-selection">
            <MessageCircle size={52} style={{ opacity: 0.12, marginBottom: "1rem" }} />
            <h3>Your Messages</h3>
            <p>Select a conversation from the sidebar, or start one by clicking "Message Host" on any property.</p>
          </div>
        )}
      </main>
    </div>
  );
}
