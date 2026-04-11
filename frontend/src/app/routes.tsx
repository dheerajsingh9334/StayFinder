import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  PublicRoute,
  RoleRoute,
  VerifiedRoute,
} from "./Manage.route";

const Login = lazy(() => import("../pages/auth/login"));
const Singup = lazy(() => import("../pages/auth/signup"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword"));
const OtpVerification = lazy(() => import("../pages/auth/OtpVerification"));
const Profile = lazy(() => import("../pages/profile/profile").then(m => ({ default: m.Profile })));
const UpdateProfile = lazy(() => import("../pages/profile/updateProfile"));
const LandingPage = lazy(() => import("../pages/home/LandingPage"));
const PropertyList = lazy(() => import("../pages/property/propertyList"));
const PropertyDetails = lazy(() => import("../pages/property/propertyDetails"));
const CreateProperty = lazy(() => import("../pages/property/CreateProperty"));
const OwnerProperty = lazy(() => import("../pages/property/OwnerProperty"));
const NearBy = lazy(() => import("../pages/property/NearBy"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const CalendarView = lazy(() => import("../pages/availbility/CalenderView"));
const BookingPage = lazy(() => import("../pages/booking/BookingPage"));
const BookingDetails = lazy(() => import("../pages/booking/BookingDetails"));
const MyBooking = lazy(() => import("../pages/booking/UserBookingPage"));
const ReviewsList = lazy(() => import("../pages/reviews/ReviewsList"));
const CreateReview = lazy(() => import("../pages/reviews/CreateReview"));
const Favorites = lazy(() => import("../pages/favorites/Favorites"));
const Notifications = lazy(() => import("../pages/notifications/Notifications"));
const HostDashboard = lazy(() => import("../pages/dashboard/HostDashBoard"));
const AdminDashboard = lazy(() => import("../pages/dashboard/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/dashboard/AdminUsers"));
const AdminProperties = lazy(() => import("../pages/dashboard/AdminProperties"));
const HostPanel = lazy(() => import("../pages/dashboard/HostPanel"));
const MessagesPage = lazy(() => import("../pages/messages/MessagesPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="loader-container"><div className="loader" /></div>}>
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
          element={<PublicRoute><Singup /></PublicRoute>}
        />
        <Route
          path="/forgot-password"
          element={<PublicRoute><ForgotPassword /></PublicRoute>}
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/properties" element={<PropertyList />} />
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
        <Route
          path="/admin-dashboard/users"
          element={
            <VerifiedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </RoleRoute>
            </VerifiedRoute>
          }
        />
        <Route
          path="/admin-dashboard/properties"
          element={
            <VerifiedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminProperties />
              </RoleRoute>
            </VerifiedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <VerifiedRoute>
              <MessagesPage />
            </VerifiedRoute>
          }
        />
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
