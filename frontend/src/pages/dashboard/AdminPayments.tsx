import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { Receipt, CheckCircle, Ban, AlertTriangle, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  booking?: { id: string; propertyId: string; status: string };
}

export default function AdminPayments() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('ALL');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payments');
      setData(res.data.data || []);
    } catch {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = data.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0);

  const filtered = data.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchSearch = !search || p.user?.name?.toLowerCase().includes(search.toLowerCase()) || p.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" text="Loading payments..." />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Platform Payments</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {data.length} transactions · Revenue: <span className="text-emerald-400 font-semibold">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search by user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40' : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Transaction</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">User</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Booking</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Payment</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Receipt size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-white/50">{p.id.substring(0, 12)}...</p>
                          <p className="text-xs text-white/60">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{p.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500">{p.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-xs text-zinc-500">{p.booking?.id?.substring(0, 8)}...</p>
                      <span className="text-[11px] text-indigo-400">{p.booking?.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-4">
                      {p.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium"><CheckCircle size={14} /> Completed</span>
                      ) : p.status === 'FAILED' ? (
                        <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium"><Ban size={14} /> Failed</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-sm font-medium"><AlertTriangle size={14} /> {p.status}</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white text-base">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-12 text-center text-zinc-600">No payments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
