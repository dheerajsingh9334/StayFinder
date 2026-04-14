import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { useEffect } from 'react';
import { getProfile } from '../features/auth/auth.slice';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { useLocation } from 'react-router-dom';
import AppErrorBoundary from '../components/ui/AppErrorBoundary';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const isAuthPage = ['/login', '/register', '/otp-verification'].includes(
    location.pathname,
  );

  const isDashboardPage = location.pathname.includes('-dashboard') || location.pathname.includes('-panel');

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(23, 19, 15, 0.92)',
            color: '#fff4df',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            border: '1px solid rgba(255, 193, 72, 0.24)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            style: {
              background: 'var(--success)',
              color: 'var(--white)',
            },
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--white)',
            },
          },
          error: {
            style: {
              background: 'var(--error)',
              color: 'var(--white)',
            },
            iconTheme: {
              primary: 'var(--error)',
              secondary: 'var(--white)',
            },
          },
        }}
      />

      {!isAuthPage && <Navbar />}
      <main
        className={
          isAuthPage || isDashboardPage
            ? ''
            : `main-content ${isHomePage ? 'main-content-home' : ''}`
        }
      >
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
    </div>
  );
};

export default App;
