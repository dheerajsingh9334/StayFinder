import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, route: '/admin-dashboard' },
  { label: 'Users', icon: Users, route: '/admin-dashboard/users' },
  { label: 'Hosts', icon: UserCheck, route: '/admin-dashboard/hosts' },
  { label: 'Properties', icon: Building2, route: '/admin-dashboard/properties' },
  { label: 'Bookings', icon: Calendar, route: '/admin-dashboard/bookings' },
  { label: 'Payments', icon: CreditCard, route: '/admin-dashboard/payments' },
  { label: 'Reviews', icon: Star, route: '/admin-dashboard/reviews' },
  { label: 'Messages', icon: MessageSquare, route: '/messages' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (route: string) => {
    if (route === '/admin-dashboard') return location.pathname === '/admin-dashboard';
    return location.pathname.startsWith(route);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col justify-between hidden md:flex shrink-0 h-full">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2">
                <ShieldCheck size={18} className="text-indigo-400" />
              </div>
              <div>
                <span className="font-semibold text-base tracking-wide">StayFinder</span>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Admin</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 px-3 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.route);
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-all duration-150 border-l-2 ${
                    active
                      ? 'bg-indigo-500/10 text-white border-l-indigo-500'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5 border-l-transparent'
                  }`}
                >
                  <item.icon
                    size={17}
                    className={active ? 'text-indigo-400' : 'text-zinc-500'}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            className="flex items-center gap-3 px-2 py-2 w-full hover:bg-white/5 transition-colors text-left"
            onClick={() => navigate('/profile')}
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <span className="font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-zinc-500 truncate">Platform Administrator</p>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-zinc-600 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a] custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
