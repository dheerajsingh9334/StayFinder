import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { Calendar, ArrowUpRight, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Booking {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string; id: string };
  property?: { title: string; id: string; ownerId: string };
}

type StatusFilter = 'ALL' | 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED' | 'COMPLETED';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  PENDING_PAYMENT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminBookings() {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bookings');
      setData(res.data.data || []);
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((b) => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchSearch = !search || b.user?.name?.toLowerCase().includes(search.toLowerCase()) || b.property?.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" text="Loading bookings..." />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Platform Bookings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{data.length} total bookings</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search guest or property..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'COMPLETED', 'CANCELLED'] as StatusFilter[]).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40' : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Booking</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Guest</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Property</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Status</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-white/50">{b.id.substring(0, 8)}...</p>
                          <p className="text-xs text-white/70">{new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{b.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500">{b.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-white/90">{b.property?.title || 'Unknown'}</p>
                      <a href={`/properties/${b.property?.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5" target="_blank" rel="noreferrer">
                        View <ArrowUpRight size={10} />
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold border ${statusColors[b.status] || 'bg-white/5 text-white/60 border-white/10'}`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">₹{Number(b.totalPrice).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-12 text-center text-zinc-600">No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
