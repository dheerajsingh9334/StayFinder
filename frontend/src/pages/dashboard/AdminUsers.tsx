import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { User, CheckCircle, Ban, AlertTriangle, UserPlus, X, Search, MessageSquare } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

type RoleFilter = 'ALL' | 'USER' | 'HOST' | 'ADMIN';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [addLoading, setAddLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id: string, currentBanStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/ban`);
      setUsers(users.map((u) => (u.id === id ? { ...u, isBanned: !currentBanStatus } : u)));
      toast.success(currentBanStatus ? 'User unbanned' : 'User banned');
    } catch {
      toast.error('Failed to update ban status');
    }
  };

  const verifyUser = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/verify`);
      setUsers(users.map((u) => (u.id === id ? { ...u, isEmailVerified: true } : u)));
      toast.success('User verified');
    } catch {
      toast.error('Failed to verify user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.email || !newForm.password) {
      toast.error('All fields are required');
      return;
    }
    try {
      setAddLoading(true);
      const { data } = await api.post('/admin/users', newForm);
      setUsers([data.user, ...users]);
      toast.success('User added');
      setShowAddForm(false);
      setNewForm({ name: '', email: '', password: '', role: 'USER' });
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to add user');
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" text="Loading users..." />
      </div>
    </AdminLayout>
  );

  const roleBadge: Record<string, string> = {
    USER: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    HOST: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manage Users</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{users.length} total users</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 font-semibold text-sm transition-colors">
            {showAddForm ? <X size={15} /> : <UserPlus size={15} />}
            {showAddForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="border border-indigo-500/20 p-6 mb-6">
            <h2 className="text-base font-semibold mb-4">Add New User</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddUser}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(newForm as any)[field.key]}
                    onChange={(e) => setNewForm({ ...newForm, [field.key]: e.target.value })}
                    disabled={addLoading}
                    className="w-full bg-transparent border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Role</label>
                <select className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2.5 text-sm text-white outline-none" value={newForm.role} onChange={(e) => setNewForm({ ...newForm, role: e.target.value })} disabled={addLoading}>
                  <option value="USER">User</option>
                  <option value="HOST">Host</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={addLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 font-semibold text-sm transition-colors">
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'USER', 'HOST', 'ADMIN'] as RoleFilter[]).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 text-xs font-semibold border transition-all ${roleFilter === r ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40' : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">User</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Status</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Role</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Joined</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 flex items-center justify-center border border-white/10">
                          <User size={16} className="text-zinc-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-zinc-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium"><Ban size={13} /> Banned</span>
                      ) : u.isEmailVerified ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><CheckCircle size={13} /> Verified</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium"><AlertTriangle size={13} /> Unverified</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold border ${roleBadge[u.role] || 'bg-white/5 text-white/60 border-white/10'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => toggleBan(u.id, u.isBanned)} className={`h-8 px-3 text-xs font-semibold border transition-all ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}>
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        {!u.isEmailVerified && (
                          <button onClick={() => verifyUser(u.id)} className="h-8 px-3 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                            Verify
                          </button>
                        )}
                        <button onClick={() => navigate(`/messages?userId=${u.id}`)} className="h-8 px-3 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1.5">
                          <MessageSquare size={12} /> Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-12 text-center text-zinc-600">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
