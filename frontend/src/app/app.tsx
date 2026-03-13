import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useEffect } from "react";
import { getProfile } from "../features/auth/auth.slice";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useLocation } from "react-router-dom";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Hide navbar/footer on auth pages
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="app-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--gray-900)',
            color: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--white)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error)',
              secondary: 'var(--white)',
            },
          },
        }}
      />
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "" : "main-content"}>
        <AppRoutes />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default App;
