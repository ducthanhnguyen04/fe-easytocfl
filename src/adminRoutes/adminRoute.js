import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default AdminRoute;
