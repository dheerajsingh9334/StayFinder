import { useEffect, useMemo, useState } from 'react';
import { Home, Building2, Briefcase, Calendar, FileText, Settings, ArrowUpRight, DollarSign, Activity, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface DashboardStats {
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  availableRooms: number;
  pendingBookings: number;
  averageRating: number;
}

interface RecentBooking {
  id: string;
  guestName: string;
  guestEmail?: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
  createdAt: string;
}

const ShiningSkeleton = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`bg-[linear-gradient(110deg,#1a1a1a,35%,#333,50%,#1a1a1a,75%,#1a1a1a)] bg-[length:200%_100%] ${className}`}
    initial={{ backgroundPosition: "200% 0" }}
    animate={{ backgroundPosition: "-200% 0" }}
    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
  />
);

export default function HostDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<'day' | 'month' | 'year'>('day');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const propertiesRes = await api.get('/property/owner/me?page=1');
      const propertiesData = propertiesRes.data;
      const propertiesList = (
        Array.isArray(propertiesData?.data) ? propertiesData.data :
        Array.isArray(propertiesData?.property) ? propertiesData.property :
        Array.isArray(propertiesData?.properties) ? propertiesData.properties : []
      );

      let totalBookings = 0;
      let totalRevenue = 0;
      let pendingBookings = 0;
      const flattened: RecentBooking[] = [];

      await Promise.all(
        propertiesList.map(async (property: any) => {
          try {
            const bookingRes = await api.get(`/booking/getBooking/${property.id}`);
            const bookingData = bookingRes.data;
            const bookings = Array.isArray(bookingData?.getBooking) ? bookingData.getBooking :
                             Array.isArray(bookingData?.booking) ? bookingData.booking :
                             Array.isArray(bookingData?.data) ? bookingData.data : [];
            totalBookings += bookings.length;
            bookings.forEach((b: any) => {
              totalRevenue += Number(b.totalPrice || 0);
              if (b.status === 'PENDING_PAYMENT') pendingBookings += 1;
              flattened.push({
                id: b.id,
                guestName: b.user?.name || b.user?.email || 'Guest',
                guestEmail: b.user?.email || '',
                propertyName: property.title,
                checkIn: b.startDate || b.checkIn,
                checkOut: b.endDate || b.checkOut,
                status: b.status,
                amount: Number(b.totalPrice || 0),
                createdAt: b.createdAt || new Date().toISOString(),
              });
            });
          } catch (err) {
            console.error('Error fetching bookings', err);
          }
        })
      );

      let totalRatings = 0;
      let ratedProperties = 0;
      propertiesList.forEach((prop: any) => {
         if (prop.averageRating > 0) {
            totalRatings += prop.averageRating;
            ratedProperties += 1;
         }
      });
      const averageRating = ratedProperties > 0 ? (totalRatings / ratedProperties) : 0.0;

      setStats({
        totalProperties: propertiesList.length,
        totalBookings,
        totalRevenue,
        availableRooms: propertiesList.length * 2,
        pendingBookings,
        averageRating,
      });

      flattened.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentBookings(flattened);
    } catch (error) {
      console.error('Failed to load host dashboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  const revenueData = useMemo(() => {
    if (recentBookings.length === 0) {
      return [
        { name: 'Jan', revenue: 0 }, { name: 'Feb', revenue: 0 },
        { name: 'Mar', revenue: 0 }, { name: 'Apr', revenue: 0 },
        { name: 'May', revenue: 0 }, { name: 'Jun', revenue: 0 },
      ];
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets: Record<string, number> = {};
    recentBookings.forEach(booking => {
       const d = new Date(booking.createdAt);
       const key = `${months[d.getMonth()]}`;
       buckets[key] = (buckets[key] || 0) + booking.amount;
    });
    const last6 = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
       let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
       let key = months[d.getMonth()];
       last6.push({ name: key, revenue: buckets[key] || 0 });
    }
    return last6;
  }, [recentBookings]);

  const bookingChartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    recentBookings.forEach(b => {
      const d = new Date(b.createdAt);
      let key = '';
      if (bookingFilter === 'day') {
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (bookingFilter === 'month') {
        key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (bookingFilter === 'year') {
        key = d.getFullYear().toString();
      }
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const result = [];
    const now = new Date();
    if (bookingFilter === 'day') {
       for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          result.push({ name: key, bookings: buckets[key] || 0 });
       }
    } else if (bookingFilter === 'month') {
       for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          result.push({ name: key, bookings: buckets[key] || 0 });
       }
    } else if (bookingFilter === 'year') {
       for (let i = 4; i >= 0; i--) {
          const d = new Date(now.getFullYear() - i, 0, 1);
          const key = d.getFullYear().toString();
          result.push({ name: key, bookings: buckets[key] || 0 });
       }
    }
    return result;
  }, [recentBookings, bookingFilter]);

  const navItems = [
    { label: 'Dashboard', icon: Home, active: true, route: '/host-dashboard' },
    { label: 'My Properties', icon: Building2, route: '/Myproperty' },
    { label: 'Bookings', icon: Calendar, route: '/bookings' },
    { label: 'Messages', icon: MessageSquare, route: '/messages' },
    { label: 'Reports', icon: FileText, route: '/reports' },
    { label: 'Settings', icon: Settings, route: '/settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      {/* Sidebar — square, dark bg */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col justify-between hidden md:flex shrink-0 h-full">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2"><Home size={18} /></div>
              <span className="font-semibold text-lg tracking-wide">StayFinder</span>
            </div>
          </div>
          <nav className="mt-8 px-3 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-colors border-l-2 ${
                  item.active
                    ? 'bg-white/[0.06] text-white border-l-white/40'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border-l-transparent'
                }`}
              >
                <item.icon size={18} className={item.active ? 'text-zinc-300' : 'text-zinc-500'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/5 shrink-0">
          <button className="flex items-center gap-3 px-2 py-2 w-full hover:bg-white/5 transition-colors text-left" onClick={() => navigate('/profile')}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <span className="font-bold">{user?.name?.charAt(0) || 'H'}</span>}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || "Host"}</p>
              <p className="text-xs text-zinc-500 truncate">Property Manager</p>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-zinc-600 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#0a0a0a] min-h-screen custom-scrollbar relative">
        
        {isLoading && (
          <div className="absolute inset-x-8 top-8 bottom-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10 bg-[#0a0a0a]/50">
             <ShiningSkeleton className="h-[140px] w-full col-span-1" />
             <ShiningSkeleton className="h-[140px] w-full col-span-1" />
             <ShiningSkeleton className="h-[140px] w-full col-span-1" />
             <ShiningSkeleton className="h-[140px] w-full col-span-1" />
             <ShiningSkeleton className="h-[380px] w-full col-span-1 lg:col-span-2 xl:col-span-3" />
             <ShiningSkeleton className="h-[380px] w-full col-span-1 xl:col-span-1" />
             <ShiningSkeleton className="h-[300px] w-full col-span-1 lg:col-span-2" />
             <ShiningSkeleton className="h-[300px] w-full col-span-1 lg:col-span-2" />
          </div>
        )}

        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
             <h1 className="text-2xl font-bold">Dashboard Overview</h1>
             <button onClick={() => navigate('/CreateProperty')} className="bg-white text-black px-5 py-2.5 font-semibold text-sm hover:bg-zinc-200 transition border border-transparent shadow-sm flex items-center gap-2">
                 <span className="text-lg leading-none">+</span> Add Property
             </button>
          </div>

          {/* Top Metric Cards — square, transparent, gap-px grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 mb-6">
            <div className="bg-[#0a0a0a] p-6 flex flex-col justify-between h-[140px]">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-zinc-400 text-sm mb-1">Total Properties</p>
                   <h2 className="text-3xl font-bold">{stats?.totalProperties || 0}</h2>
                 </div>
                 <div className="bg-white/5 p-2.5 text-zinc-400"><Building2 size={20} /></div>
               </div>
            </div>

            <div className="bg-[#0a0a0a] p-6 flex flex-col justify-between h-[140px]">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-zinc-400 text-sm mb-1">Total Bookings</p>
                   <h2 className="text-3xl font-bold">{stats?.totalBookings || 0}</h2>
                 </div>
                 <div className="bg-emerald-500/10 p-2.5 text-emerald-500"><Briefcase size={20} /></div>
               </div>
            </div>

            <div className="bg-[#0a0a0a] p-6 flex flex-col justify-between h-[140px]">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-zinc-400 text-sm mb-1">Total Revenue</p>
                   <h2 className="text-3xl font-bold">₹{(stats?.totalRevenue || 0).toLocaleString()}</h2>
                 </div>
                 <div className="bg-purple-500/10 p-2.5 text-purple-400"><DollarSign size={20} /></div>
               </div>
            </div>

            <div className="bg-[#0a0a0a] p-6 flex flex-col justify-between h-[140px]">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-zinc-400 text-sm mb-1">Average Rating</p>
                   <h2 className="text-3xl font-bold">{stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}</h2>
                 </div>
                 <div className="bg-amber-500/10 p-2.5 text-amber-500"><Activity size={20} /></div>
               </div>
            </div>
          </div>

          {/* Charts Row — square, transparent */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">
            <div className="border border-white/5 p-6 h-[380px] flex flex-col" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-base font-semibold truncate">Revenue Overview</h3>
                 <button className="text-xs text-zinc-400 bg-white/5 px-3 py-1.5 hover:text-white transition-colors shrink-0">Last 6 months ⌄</button>
              </div>
              <div className="flex-1 w-full min-h-0 relative -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#333" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#333" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} dx={-10} width={80} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '0', color: '#fff'}} itemStyle={{color: '#fff'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-white/5 p-6 h-[380px] flex flex-col" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-base font-semibold truncate">Booking Pipeline</h3>
                 <div className="flex items-center gap-2">
                   <select
                     value={bookingFilter}
                     onChange={(e) => setBookingFilter(e.target.value as any)}
                     className="bg-white/5 text-xs text-zinc-400 px-2 py-1.5 border-none focus:ring-0 cursor-pointer outline-none hover:text-white"
                   >
                     <option value="day">Day</option>
                     <option value="month">Month</option>
                     <option value="year">Year</option>
                   </select>
                   <span className="text-xs text-zinc-500 cursor-pointer hover:text-white transition-colors shrink-0">View All</span>
                 </div>
              </div>
              <div className="flex-1 w-full relative min-h-0 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingChartData}>
                    <XAxis dataKey="name" stroke="#333" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#333" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} dx={-10} width={40} allowDecimals={false} />
                    <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '0', color: '#fff'}} itemStyle={{color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="bookings" fill="#10b981" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Lists Row — square, transparent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            {/* Recent Bookings */}
            <div className="border border-white/5 p-6 min-h-[300px]" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-base font-semibold truncate">Recent Bookings</h3>
                 <span className="text-xs text-zinc-500 cursor-pointer hover:text-white transition-colors shrink-0">View All</span>
              </div>
              <div className="space-y-4">
                {recentBookings.slice(0, 4).map((booking) => {
                  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
                  const pillColor = isConfirmed ? 'text-emerald-400 bg-emerald-400/10' : booking.status === 'PENDING_PAYMENT' ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 bg-zinc-800';
                  return (
                    <div key={booking.id} className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-2 -mx-2 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-white/5 text-xs text-zinc-400 shrink-0">
                          {booking.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{booking.guestName}</p>
                          <p className="text-xs text-zinc-500 truncate">{booking.guestEmail || `${booking.guestName.toLowerCase().replace(' ', '')}@guest.com`}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 font-semibold tracking-wide shrink-0 ml-2 ${pillColor}`}>
                        {isConfirmed ? 'Confirmed' : booking.status === 'PENDING_PAYMENT' ? 'Pending' : 'Cancelled'}
                      </span>
                    </div>
                  );
                })}
                {recentBookings.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">No recent bookings found.</p>}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="border border-white/5 p-6 min-h-[300px]" style={{ minWidth: 0 }}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-base font-semibold truncate">Recent Activities</h3>
                 <span className="text-xs text-zinc-500 cursor-pointer hover:text-white transition-colors shrink-0">View All</span>
              </div>
              <div className="space-y-6">
                {recentBookings.slice(0, 3).map((booking, i) => (
                  <div key={`act-${booking.id}`} className="flex gap-4">
                    <div className="mt-1 relative shrink-0">
                      <div className="w-6 h-6 flex items-center justify-center bg-white/5 border border-white/10 z-10 relative">
                         {i === 0 ? <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div> :
                          i === 1 ? <DollarSign size={10} className="text-purple-400" /> :
                          <Calendar size={10} className="text-blue-400" />}
                      </div>
                      {i !== 2 && <div className="absolute top-6 bottom-[-24px] left-[11px] w-[2px] bg-white/5"></div>}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">Booking {i === 0 ? 'confirmed' : i === 1 ? 'initiated' : 'updated'} for {booking.guestName.split(' ')[0]}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{booking.propertyName.slice(0, 20)}... • {i * 2 + 1} hours ago</p>
                    </div>
                  </div>
                ))}
                {recentBookings.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">No recent pipeline activity.</p>}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
