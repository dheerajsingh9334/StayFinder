import { useEffect, useState, useRef } from "react";
import { api } from "../../services/api";
import { io, Socket } from "socket.io-client";
import { User, Send, CheckCircle2 } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export default function MessagesPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Initialize Socket
    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("new_message", (data) => {
      setMessages(prev => {
        // don't append if it's from another chat
        if (data.senderId === activeChatId) {
          return [...prev, data];
        }
        return prev;
      });
      // also update latest message in conversations list
      fetchConversations();
    });

    newSocket.on("typing", (data) => {
      setTypingUsers(prev => ({ ...prev, [data.senderId]: data.isTyping }));
    });

    return () => {
      newSocket.close();
    };
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/message/conversations");
      setConversations(data.conversations || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const loadChat = async (otherUserId: string) => {
    setActiveChatId(otherUserId);
    try {
      const { data } = await api.get(`/message/history/${otherUserId}`);
      setMessages(data.messages || []);
    } catch {
      // ignore
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChatId || !socket) return;
    
    const msgData = {
      receiverId: activeChatId,
      content: newMessage,
    };
    
    socket.emit("send_message", msgData);
    
    // Optimistic update
    setMessages(prev => [...prev, {
      senderId: user?.id,
      receiverId: activeChatId,
      content: newMessage,
      createdAt: new Date().toISOString()
    }]);
    
    setNewMessage("");
    socket.emit("typing", { receiverId: activeChatId, isTyping: false });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket || !activeChatId) return;
    socket.emit("typing", { receiverId: activeChatId, isTyping: e.target.value.length > 0 });
  };

  if (loading) return <Loader size="lg" text="Loading your messages..." />;

  const activeUser = conversations.find(c => c.user.id === activeChatId)?.user;

  return (
    <div className="page-container" style={{ display: "flex", height: "calc(100vh - 100px)", gap: "var(--space-4)" }}>
      {/* Sidebar */}
      <div className="card" style={{ width: "300px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)" }}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Conversations</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <p style={{ padding: "var(--space-4)", color: "var(--gray-500)", textAlign: "center" }}>No messages yet</p>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.user.id} 
                className="hover-effect"
                style={{ 
                  display: "flex", 
                  gap: "var(--space-3)", 
                  padding: "var(--space-3) var(--space-4)",
                  borderBottom: "1px solid var(--gray-100)",
                  cursor: "pointer",
                  background: activeChatId === conv.user.id ? "var(--primary-50)" : "transparent"
                }}
                onClick={() => loadChat(conv.user.id)}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {conv.user.avatarUrl ? <img src={conv.user.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%" }} alt="" /> : <User size={20} />}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "2px" }}>{conv.user.name}</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChatId ? (
          <>
            <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
               <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeUser?.avatarUrl ? <img src={activeUser.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%" }} alt="" /> : <User size={20} />}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600 }}>{activeUser?.name}</h3>
                  {typingUsers[activeChatId] && <span style={{ fontSize: "var(--text-xs)", color: "var(--accent-emerald)" }}>Typing...</span>}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {messages.map((m, idx) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={idx} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                    <div style={{ 
                      background: isMe ? "var(--primary-600)" : "var(--gray-100)", 
                      color: isMe ? "white" : "var(--gray-800)",
                      padding: "var(--space-2) var(--space-3)", 
                      borderRadius: "calc(var(--radius-lg))",
                      borderBottomRightRadius: isMe ? "0" : "calc(var(--radius-lg))",
                      borderBottomLeftRadius: !isMe ? "0" : "calc(var(--radius-lg))",
                    }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)", marginTop: "4px", textAlign: isMe ? "right" : "left", display:'flex', gap:'4px', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems:'center' }}>
                      {new Date(m.createdAt || m.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      {isMe && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-200)", display: "flex", gap: "var(--space-2)" }}>
              <input 
                className="form-input" 
                style={{ flex: 1 }} 
                placeholder="Type your message..." 
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
              />
              <button 
                className="btn btn-primary" 
                style={{ padding: "0 var(--space-4)", display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={sendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)" }}>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
