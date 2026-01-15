import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logout } from "../../features/auth/auth.slice";
import UpdateProfile from "./updateProfile";

export const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isloading } = useSelector((state: RootState) => state.auth);

  if (isloading) {
    return <>Loading....</>;
  }
  if (!user) {
    return <div>no profile Data</div>;
  }

  const handleLogout = () => {
    dispatch(logout());
  };
  console.log(user.role);

  return (
    <div>
      <h2>Profile</h2>
      <p>img:{user.avatarUrl}</p>
      <p>Name:{user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {user.phone && <p>Phone:{user.phone}</p>}
      <button onClick={handleLogout}>Logout</button>
      <UpdateProfile />
    </div>
  );
};
