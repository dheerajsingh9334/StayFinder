import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useEffect } from "react";
import { getProfile } from "../features/auth/auth.slice";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useLocation } from "react-router-dom";
import AppErrorBoundary from "../components/ui/AppErrorBoundary";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Hide navbar/footer on auth pages
  const isAuthPage = ["/login", "/register", "/otp-verification"].includes(
    location.pathname,
  );

  useEffect(() => {
    // Avoid calling /auth/me on public auth pages to prevent unnecessary 401 loops.
    if (!isAuthPage) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthPage]);

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--gray-900)",
            color: "var(--white)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            fontSize: "var(--text-sm)",
          },
          success: {
            iconTheme: {
              primary: "var(--success)",
              secondary: "var(--white)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--error)",
              secondary: "var(--white)",
            },
          },
        }}
      />
      {!isAuthPage && <Navbar />}
      <main
        className={
          isAuthPage
            ? ""
            : `main-content ${isHomePage ? "main-content-home" : ""}`
        }
      >
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default App;
