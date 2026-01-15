import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useEffect } from "react";
import { getProfile } from "../features/auth/auth.slice";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);
  return (
    <>
      <Toaster position="top-right" />;
      <AppRoutes />;
    </>
  );
};

export default App;
