import { Navigate, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  PublicRoute,
  RoleRoute,
  VerifiedRoute,
} from "./Manage.route";
import Login from "../pages/auth/login";
import Singup from "../pages/auth/signup";
import ChangePassword from "../pages/auth/ChangePassword";
import ForgotPassword from "../pages/auth/forgotPassword";
import OtpVerification from "../pages/auth/OtpVerification";
import { Profile } from "../pages/profile/profile";
import UpdateProfile from "../pages/profile/updateProfile";
import PropertyList from "../pages/property/propertyList";
import PropertyDetails from "../pages/property/propertyDetails";
import CreateProperty from "../pages/property/CreateProperty";
import OwnerProperty from "../pages/property/OwnerProperty";
import NearBy from "../pages/property/NearBy";
import SearchPage from "../pages/search/SearchPage";
import CalendarView from "../pages/availbility/CalenderView";
import BookingPage from "../pages/booking/BookingPage";
import BookingDetails from "../pages/booking/BookingDetails";
import MyBooking from "../pages/booking/UserBookingPage";
import ReviewsList from "../pages/reviews/ReviewsList";
import CreateReview from "../pages/reviews/CreateReview";
import Favorites from "../pages/favorites/Favorites";
import Notifications from "../pages/notifications/Notifications";
import HostDashboard from "../pages/dashboard/HostDashBoard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import HostPanel from "../pages/dashboard/HostPanel";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={<PublicRoute>{<Singup />}</PublicRoute>}
      />
      <Route
        path="/forgot-password"
        element={<PublicRoute>{<ForgotPassword />}</PublicRoute>}
      />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route
        path="/account/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Profile Routes */}
      <Route
        path="/profile"
        element={
          <VerifiedRoute>
            <Profile />
          </VerifiedRoute>
        }
      />
      <Route
        path="/profile/update"
        element={
          <VerifiedRoute>
            <UpdateProfile />
          </VerifiedRoute>
        }
      />

      {/* Property Routes */}
      <Route path="/" element={<PropertyList />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/nearby" element={<NearBy />} />
      <Route
        path="/CreateProperty"
        element={
          <VerifiedRoute>
            <RoleRoute allowedRoles={["HOST"]}>
              <CreateProperty />
            </RoleRoute>
          </VerifiedRoute>
        }
      />
      <Route
        path="/Myproperty"
        element={
          <VerifiedRoute>
            <RoleRoute allowedRoles={["HOST"]}>
              <OwnerProperty />
            </RoleRoute>
          </VerifiedRoute>
        }
      />

      {/* Booking Routes */}
      <Route
        path="/booking/new"
        element={
          <VerifiedRoute>
            <BookingPage />
          </VerifiedRoute>
        }
      />
      <Route
        path="/booking/:id"
        element={
          <VerifiedRoute>
            <BookingDetails />
          </VerifiedRoute>
        }
      />
      <Route
        path="/mybooking"
        element={
          <VerifiedRoute>
            <MyBooking />
          </VerifiedRoute>
        }
      />
      <Route
        path="/CalendarView/properties/:propertyId"
        element={<CalendarView />}
      />

      {/* Reviews Routes */}
      <Route
        path="/reviews"
        element={
          <VerifiedRoute>
            <ReviewsList />
          </VerifiedRoute>
        }
      />
      <Route
        path="/reviews/create/:propertyId"
        element={
          <VerifiedRoute>
            <CreateReview />
          </VerifiedRoute>
        }
      />

      {/* Favorites Routes */}
      <Route
        path="/favorites"
        element={
          <VerifiedRoute>
            <Favorites />
          </VerifiedRoute>
        }
      />

      {/* Notifications Routes */}
      <Route
        path="/notifications"
        element={
          <VerifiedRoute>
            <Notifications />
          </VerifiedRoute>
        }
      />

      {/* Dashboard Routes */}
      <Route
        path="/host-dashboard"
        element={
          <VerifiedRoute>
            <RoleRoute allowedRoles={["HOST"]}>
              <HostDashboard />
            </RoleRoute>
          </VerifiedRoute>
        }
      />
      <Route
        path="/host-panel"
        element={
          <VerifiedRoute>
            <RoleRoute allowedRoles={["HOST"]}>
              <HostPanel />
            </RoleRoute>
          </VerifiedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <VerifiedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          </VerifiedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
