// Single responsibility: Read auth state

import { useSelector } from "react-redux";
import type { RootState } from "../store";
// Is hook ka kaam:

// Redux ko UI se abstract karna

// Selector logic centralize karna

// ✅ Code
// import { useSelector } from "react-redux";
// import { RootState } from "../store";

// export const useAuth = () => {
//   const user = useSelector((state: RootState) => state.auth.user);

//   return {
//     user,
//     isAuthenticated: Boolean(user),
//   };
// };

// 🧠 Why this is important

// Agar kal tum:

// Redux se React Query pe shift karo

// Auth state ka structure change karo

// Tum sirf useAuth.ts change karoge.
// Pages aur components safe rahenge.

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isloading,
  };
};
