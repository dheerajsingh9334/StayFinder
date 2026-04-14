import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminLayout from './AdminLayout';

interface AdminStats {
  totalUsers: number;
  totalHosts: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  pendingProperties: number;
}

interface RecentBooking {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  property?: { title: string };
}

const ShiningSkeleton = ({ className = '' }: { className?: string }) => (
  <motion.div
    className={`bg-[linear-gradient(110deg,#1a1a1a,35%,#2a2a2a,50%,#1a1a1a,75%,#1a1a1a)] bg-[length:200%_100%] ${className}`}
    initial={{ backgroundPosition: '200% 0' }}
    animate={{ backgroundPosition: '-200% 0' }}
    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
  />
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<'day' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, propertiesRes, bookingsRes] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/properties'),
        api.get('/admin/bookings'),
      ]);

      const users = usersRes.status === 'fulfilled' ? usersRes.value.data?.users || [] : [];
      const properties = propertiesRes.status === 'fulfilled' ? propertiesRes.value.data?.data || [] : [];
      const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value.data?.data || [] : [];

      const totalUsers = users.filter((u: any) => u.role === 'USER').length;
      const totalHosts = users.filter((u: any) => u.role === 'HOST').length;
      const pendingProperties = properties.filter((p: any) => p.status === 'PENDING').length;
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + Number(b.totalPrice || 0), 0);

      setStats({
        totalUsers,
        totalHosts,
        totalProperties: properties.length,
        totalBookings: bookings.length,
        totalRevenue,
        pendingProperties,
      });

      setRecentBookings(
        [...bookings].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets: Record<string, number> = {};
    recentBookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = months[d.getMonth()];
      buckets[key] = (buckets[key] || 0) + Number(b.totalPrice || 0);
    });
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = months[d.getMonth()];
      return { name: key, revenue: buckets[key] || 0 };
    });
  }, [recentBookings]);

  const bookingChartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    recentBookings.forEach((b) => {
      const d = new Date(b.createdAt);
      let key = '';
      if (bookingFilter === 'day') {
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (bookingFilter === 'month') {
        key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        key = d.getFullYear().toString();
      }
      buckets[key] = (buckets[key] || 0) + 1;
    });
    const now = new Date();
    if (bookingFilter === 'day') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { name: key, bookings: buckets[key] || 0 };
      });
    } else if (bookingFilter === 'month') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return { name: key, bookings: buckets[key] || 0 };
      });
    } else {
      return Array.from({ length: 5 }, (_, i) => {
        const key = (now.getFullYear() - (4 - i)).toString();
        return { name: key, bookings: buckets[key] || 0 };
      });
    }
  }, [recentBookings, bookingFilter]);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { label: 'Total Hosts', value: stats.totalHosts, icon: UserCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Pending Approvals', value: stats.pendingProperties, icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10' },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 min-h-screen relative">
        {isLoading && (
          <div className="absolute inset-x-8 top-8 grid grid-cols-2 lg:grid-cols-3 gap-6 z-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <ShiningSkeleton key={i} className="h-[110px] w-full" />
            ))}
            <ShiningSkeleton className="h-[360px] w-full col-span-2 mt-2" />
            <ShiningSkeleton className="h-[360px] w-full col-span-2 lg:col-span-1 mt-2" />
          </div>
        )}

        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Admin Overview</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Platform-wide statistics and management</p>
            </div>
            <button
              onClick={() => navigate('/admin-dashboard/properties')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 font-semibold text-sm transition-colors"
            >
              {stats?.pendingProperties ? (
                <span className="bg-white text-indigo-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pendingProperties}
                </span>
              ) : (
                <CheckCircle size={16} />
              )}
              Approvals
            </button>
          </div>

          {/* Stat Cards — fully square, transparent */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 mb-6 border border-white/5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-[#0a0a0a] p-5 flex flex-col justify-between h-[110px] hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-500 text-xs mb-1.5">{card.label}</p>
                    <h2 className="text-2xl font-bold">{card.value}</h2>
                  </div>
                  <div className={`${card.bg} p-2 ${card.color}`}>
                    <card.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts — square, transparent */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">
            {/* Revenue chart */}
            <div className="border border-white/5 p-6 h-[360px] flex flex-col" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold">Revenue Overview</h3>
                <span className="text-xs text-zinc-500 bg-white/5 px-3 py-1.5">Last 6 months</span>
              </div>
              <div className="flex-1 w-full min-h-0 relative -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="adminColorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#333" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} width={80} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '0', color: '#fff' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#adminColorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Booking bar chart */}
            <div className="border border-white/5 p-6 h-[360px] flex flex-col" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Bookings</h3>
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value as any)}
                  className="bg-white/5 text-xs text-zinc-400 px-2 py-1.5 border-none focus:ring-0 cursor-pointer outline-none hover:text-white"
                >
                  <option value="day">Day</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div className="flex-1 w-full relative min-h-0 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingChartData}>
                    <XAxis dataKey="name" stroke="#333" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} width={40} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '0', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="bookings" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            {/* Recent Bookings */}
            <div className="border border-white/5 p-6 min-h-[280px]" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold">Recent Bookings</h3>
                <button onClick={() => navigate('/admin-dashboard/bookings')} className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                  View All <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED' || b.status === 'COMPLETED';
                  const pillColor = isConfirmed
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : b.status === 'PENDING_PAYMENT'
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-zinc-400 bg-zinc-800';
                  return (
                    <div key={b.id} className="flex justify-between items-center hover:bg-white/5 p-2 -mx-2 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0 border border-white/5">
                          {(b.user?.name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{b.user?.name || 'Guest'}</p>
                          <p className="text-xs text-zinc-500 truncate">{b.property?.title || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className={`text-[10px] px-2.5 py-1 font-semibold ${pillColor}`}>
                          {isConfirmed ? 'Confirmed' : b.status === 'PENDING_PAYMENT' ? 'Pending' : 'Cancelled'}
                        </span>
                        <span className="text-sm font-bold text-white">₹{Number(b.totalPrice).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
                {recentBookings.length === 0 && (
                  <p className="text-sm text-zinc-600 text-center py-6">No bookings yet.</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-white/5 p-6 min-h-[280px]" style={{ minWidth: 0 }}>
              <h3 className="text-base font-semibold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
                {[
                  { label: 'Manage Users', route: '/admin-dashboard/users', icon: Users, color: 'text-sky-400' },
                  { label: 'Manage Hosts', route: '/admin-dashboard/hosts', icon: UserCheck, color: 'text-indigo-400' },
                  { label: 'Properties', route: '/admin-dashboard/properties', icon: Building2, color: 'text-purple-400' },
                  { label: 'Bookings', route: '/admin-dashboard/bookings', icon: Calendar, color: 'text-emerald-400' },
                  { label: 'Payments', route: '/admin-dashboard/payments', icon: DollarSign, color: 'text-amber-400' },
                  { label: 'Reviews', route: '/admin-dashboard/reviews', icon: Star, color: 'text-rose-400' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.route)}
                    className="flex items-center gap-3 p-4 bg-[#0a0a0a] hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <action.icon size={17} className={action.color} />
                    <span className="text-sm font-medium text-zinc-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
