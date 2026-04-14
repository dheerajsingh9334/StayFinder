import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { Building2, Check, X, MessageCircle, Search, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from './AdminLayout';

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED';

interface AdminProperty {
  id: string;
  title: string;
  status: string;
  price: number;
  createdAt: string;
  owner?: { id: string; name: string; email: string };
}

const PAGE_SIZE = 20;

export default function AdminProperties() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hostIdFilter = params.get('hostId');

  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const { data } = await api.get(`/admin/properties?${qs}`);
      let list: AdminProperty[] = data.data || [];
      if (hostIdFilter) list = list.filter((p) => p.owner?.id === hostIdFilter);
      setProperties(list);
      setTotal(data.total ?? list.length);
      setTotalPage(data.totalPage ?? 1);
    } catch {
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, hostIdFilter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status });
      setProperties(properties.map((p) => (p.id === id ? { ...p, status } : p)));
      toast.success(`Property marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const pendingCount = properties.filter((p) => p.status === 'PENDING').length;

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    INACTIVE: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    DELETED: 'bg-red-900/20 text-red-600 border-red-900/30',
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{hostIdFilter ? 'Host Properties' : 'Manage Properties'}</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {total} total
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <Clock size={11} /> {pendingCount} pending
                </span>
              )}
            </p>
          </div>
          {hostIdFilter && (
            <button onClick={() => navigate('/admin-dashboard/properties')} className="text-xs text-zinc-400 hover:text-white border border-white/10 px-3 py-1.5 transition-colors">
              ← Show All
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search title or host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE', 'DELETED'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as StatusFilter)}
                className={`px-3 py-2 text-xs font-semibold border transition-all ${
                  statusFilter === s
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                    : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                {s}
                {s === 'PENDING' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-white/5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" text="Loading properties..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Property</th>
                    <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Host</th>
                    <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Price</th>
                    <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Status</th>
                    <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{p.title}</p>
                            <p className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-white">{p.owner?.name || 'Unknown'}</p>
                        <p className="text-xs text-zinc-500">{p.owner?.email}</p>
                      </td>
                      <td className="p-4 font-bold text-white">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold border ${statusColors[p.status] || 'bg-white/5 text-white/60 border-white/10'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          {p.status !== 'ACTIVE' && (
                            <button onClick={() => updateStatus(p.id, 'ACTIVE')} className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                              <Check size={13} /> Approve
                            </button>
                          )}
                          {p.status !== 'REJECTED' && (
                            <button onClick={() => updateStatus(p.id, 'REJECTED')} className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                              <X size={13} /> Reject
                            </button>
                          )}
                          {p.owner?.id && (
                            <button onClick={() => navigate(`/messages?userId=${p.owner!.id}`)} className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                              <MessageCircle size={13} /> Chat
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {properties.length === 0 && !loading && (
                    <tr><td colSpan={5} className="p-12 text-center text-zinc-600">No properties found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPage > 1 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-xs text-zinc-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPage }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPage || Math.abs(p - page) <= 2)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e${idx}`} className="h-8 w-8 flex items-center justify-center text-zinc-600 text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`h-8 w-8 flex items-center justify-center text-xs border transition-colors ${
                        page === item
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page === totalPage}
                className="h-8 w-8 flex items-center justify-center border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
