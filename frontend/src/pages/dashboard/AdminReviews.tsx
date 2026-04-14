import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { Star, ArrowUpRight, Trash2, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string; email: string };
  property?: { id: string; title: string };
}

export default function AdminReviews() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      setData(res.data.data || []);
    } catch {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setData(data.filter((r) => r.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const avgRating = data.length > 0 ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1) : '—';

  const filtered = data.filter((r) => {
    const matchSearch = !search || r.user?.name?.toLowerCase().includes(search.toLowerCase()) || r.property?.title?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && r.rating >= minRating;
  });

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" text="Loading reviews..." />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Platform Reviews</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {data.length} reviews · Avg: <span className="text-amber-400 font-semibold">⭐ {avgRating}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search user or property..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">Min Rating:</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setMinRating(r)} className={`w-8 h-8 text-xs font-semibold border transition-all ${minRating === r ? 'bg-amber-500/10 text-amber-400 border-amber-500/40' : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'}`}>
                  {r === 0 ? 'All' : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide w-1/4">User & Property</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Rating</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide w-1/2">Comment</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Date</th>
                  <th className="p-4 font-semibold text-white/60 text-xs uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 align-top">
                      <p className="font-semibold text-white truncate max-w-[180px]">{r.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500 mb-2">{r.user?.email}</p>
                      <div className="mt-1 pt-2 border-t border-white/5">
                        <p className="text-xs font-semibold text-zinc-500 uppercase mb-0.5">Property</p>
                        <p className="font-medium text-white/85 truncate max-w-[180px] text-sm">{r.property?.title || 'Unknown'}</p>
                        <a href={`/properties/${r.property?.id}`} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5" target="_blank" rel="noreferrer">
                          View <ArrowUpRight size={8} />
                        </a>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 inline-flex w-fit">
                        <Star size={12} className="text-amber-400" fill="currentColor" />
                        <span className="font-bold text-sm text-white">{r.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-white/75 text-sm leading-relaxed line-clamp-3">{r.comment}</p>
                    </td>
                    <td className="p-4 align-top text-xs text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 align-top">
                      <button onClick={() => deleteReview(r.id)} className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-12 text-center text-zinc-600">No reviews found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
