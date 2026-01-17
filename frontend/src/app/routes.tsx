import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicRoute, RoleRoute } from "./Manage.route";
import Login from "../pages/auth/login";
import { Profile } from "../pages/profile/profile";
import PropertyList from "../pages/property/propertyList";
import PropertyDetails from "../pages/property/propertyDetails";
import CreateProperty from "../pages/property/CreateProperty";
import OwnerProperty from "../pages/property/OwnerProperty";
import Singup from "../pages/auth/signup";
import ChangePassword from "../pages/auth/ChangePassword";

export default function AppRoutes() {
  return (
    <Routes>
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
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="account/changePassword"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<PropertyList />}></Route>
      <Route
        path="/CreateProperty"
        element={
          <RoleRoute allowedRoles={["HOST"]}>
            <CreateProperty />
          </RoleRoute>
        }
      />
      <Route
        path="/Myproperty"
        element={
          <RoleRoute allowedRoles={["HOST"]}>
            <OwnerProperty />
          </RoleRoute>
        }
      />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route
      // path="/host"
      // element={
      //   <ProtectedRoute>
      //     <RoleRoute allowedRoles={["HOST"]}>
      //       <HostDashboard />
      //     </RoleRoute>
      //   </ProtectedRoute>
      // }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
