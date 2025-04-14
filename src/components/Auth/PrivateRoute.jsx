import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../Loading/Loading";

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
