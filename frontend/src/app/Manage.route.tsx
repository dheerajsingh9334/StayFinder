import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { RootState } from "../store";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isloading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (isloading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isloading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (isloading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const RoleRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: Array<"USER" | "HOST" | "ADMIN">;
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isloading, user } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (
      !isloading &&
      isAuthenticated &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      toast.error("you are not allowed to access this Page", {
        id: "role-error",
      });
    }
  }, [isAuthenticated, isloading, user, allowedRoles]);

  if (isloading) {
    return <div>Loadinng....</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <div>Loadinng....</div>;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export const VerifiedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isloading, user } = useSelector(
    (state: RootState) => state.auth,
  );

  if (isloading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  if (!user.isEmailVerified) {
    return <Navigate to={`/otp-verification?email=${user.email}`} replace />;
  }

  return children;
};
