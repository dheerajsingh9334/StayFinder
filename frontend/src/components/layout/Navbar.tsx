import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { logout } from '../../features/auth/auth.slice';
import {
  Search,
  LogOut,
  Heart,
  MessageSquare,
  User,
  X,
  Menu,
  MessageCircle,
} from 'lucide-react';
import { FeyButton } from '../ui/fey-button';
import { useFavorites } from '../../features/favorites/favorites.hooks';
import { getApiUrl } from '../../utils/config';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const { data: favorites } = useFavorites();
  const wishCount = favorites?.size || 0;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (search.trim()) navigate(`/?q=${encodeURIComponent(search)}`);
    },
    [search, navigate],
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="gn-navbar">
      <div className="gn-container">
        {/* Logo */}
        <button className="gn-logo-btn" onClick={() => navigate('/')}>
          <span className="gn-logo-text">StayFinder</span>
        </button>

        {/* Search box */}
        <form className="gn-search" onSubmit={handleSearch}>
          <Search size={13} className="gn-search-icon" />
          <input
            className="gn-search-input"
            placeholder="Search properties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="gn-search-clear"
              onClick={() => setSearch('')}
            >
              <X size={12} />
            </button>
          )}
        </form>

        {/* Nav actions — FeyButton style, desktop */}
        <div className="gn-links">
          <FeyButton
            className="min-w-0 px-6 h-12 text-base"
            onClick={() => navigate('/properties')}
          >
            Explore
          </FeyButton>

          {isAuthenticated && user ? (
            <>
              {user.role === 'HOST' && (
                <>
                  <FeyButton
                    className="min-w-0 px-6 h-12 text-base"
                    onClick={() => navigate('/host-panel')}
                  >
                    Host Panel
                  </FeyButton>
                  <FeyButton
                    className="min-w-0 px-6 h-12 text-base"
                    onClick={() => navigate('/Myproperty')}
                  >
                    My Properties
                  </FeyButton>
                </>
              )}
              {user.role === 'ADMIN' && (
                <FeyButton
                  className="min-w-0 px-6 h-12 text-base"
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Admin
                </FeyButton>
              )}
              <FeyButton
                className="min-w-0 px-6 h-12 text-base"
                onClick={() => navigate('/reviews')}
              >
                <MessageSquare size={17} className="mr-2" />
                Reviews
              </FeyButton>
              <FeyButton
                className="min-w-0 px-6 h-12 text-base"
                onClick={() => navigate('/favorites')}
              >
                <div className="gn-badge-wrapper">
                  <Heart size={17} className="mr-2" />
                  {wishCount > 0 && (
                    <span className="gn-badge">{wishCount}</span>
                  )}
                </div>
                Wishlist
              </FeyButton>
              <FeyButton
                className="min-w-0 px-6 h-12 text-base"
                onClick={() => navigate('/messages')}
              >
                <MessageCircle size={17} className="mr-2" />
                Messages
              </FeyButton>
              <FeyButton
                className="min-w-0 px-6 h-12 text-base"
                onClick={() => navigate('/profile')}
              >
                <User size={17} className="mr-2" />
                Profile
              </FeyButton>
              <FeyButton
                className="min-w-0 px-6 h-12 text-base !bg-red-500/10 text-red-400 hover:after:bg-red-500/20"
                onClick={handleLogout}
              >
                <LogOut size={17} className="mr-2" />
                Logout
              </FeyButton>
            </>
          ) : (
            <>
              <FeyButton
                className="min-w-0 px-8 h-12 text-base"
                onClick={() => navigate('/login')}
              >
                Log in
              </FeyButton>
              <FeyButton
                className="min-w-0 px-8 h-12 text-base"
                onClick={() => navigate('/register')}
              >
                Sign up
              </FeyButton>
              <FeyButton
                className="min-w-0 px-6 h-12 text-base"
                onClick={() =>
                  (window.location.href = `${getApiUrl()}/auth/google`)
                }
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  style={{ width: 18, height: 18 }}
                  className="mr-3"
                />
                Google
              </FeyButton>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          ref={mobileRef as any}
          className="gn-hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="gn-mobile-menu">
          <button
            className="gn-mobile-link"
            onClick={() => navigate('/properties')}
          >
            Explore
          </button>
          {isAuthenticated && user ? (
            <>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/mybooking')}
              >
                My Bookings
              </button>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/messages')}
              >
                Messages
              </button>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/favorites')}
              >
                Wishlist
              </button>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/reviews')}
              >
                Reviews
              </button>
              {user.role === 'HOST' && (
                <>
                  <button
                    className="gn-mobile-link"
                    onClick={() => navigate('/host-panel')}
                  >
                    Host Panel
                  </button>
                  <button
                    className="gn-mobile-link"
                    onClick={() => navigate('/Myproperty')}
                  >
                    My Properties
                  </button>
                </>
              )}
              {user.role === 'ADMIN' && (
                <button
                  className="gn-mobile-link"
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Admin
                </button>
              )}
              <button className="gn-mobile-link danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/login')}
              >
                Log in
              </button>
              <button
                className="gn-mobile-link"
                onClick={() => navigate('/register')}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
