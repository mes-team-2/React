import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthGuard = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  // 로그인 안 됐으면 어떤 URL이든 로그인으로
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthGuard;
