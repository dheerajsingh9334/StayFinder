import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { UserCheck, MessageSquare, Building2, Calendar, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Host {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminHosts() {
  const navigate = useNavigate();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      const allUsers: Host[] = data.users || [];
      setHosts(allUsers.filter((u) => u.role === 'HOST'));
    } catch {
      toast.error('Failed to fetch hosts');
    } finally {
      setLoading(false);
    }
  };

  const filtered = hosts.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" text="Loading hosts..." />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Host Management</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{hosts.length} hosts registered</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Hosts Grid — square cards, transparent */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/5">
          {filtered.map((host) => (
            <div
              key={host.id}
              className="bg-[#0a0a0a] p-5 hover:bg-white/[0.03] transition-colors group border-b border-r border-white/5"
            >
              {/* Host Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {host.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="font-semibold text-white truncate">{host.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{host.email}</p>
                </div>
                <div className={`shrink-0 w-2 h-2 rounded-full ${host.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
              </div>

              {/* Info Row */}
              <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <UserCheck size={12} className="text-indigo-400" />
                  <span>Host</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>Joined {new Date(host.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
                {host.isBanned && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 font-semibold">Banned</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => navigate(`/messages?userId=${host.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 py-2 text-xs font-semibold transition-all"
                >
                  <MessageSquare size={14} />
                  Chat with Host
                </button>
                <button
                  onClick={() => navigate(`/admin-dashboard/properties?hostId=${host.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 py-2 text-xs font-semibold transition-all"
                >
                  <Building2 size={14} />
                  Properties
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600">
              <UserCheck size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">No hosts found</p>
              <p className="text-sm mt-1">{search ? 'Try a different term' : 'No hosts registered yet'}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
