import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleRoutes = {
  admin: '/admin',
  institute: '/institute',
  student: '/student',
  company: '/company'
};

function PrivateRoute({ children, role }) {
  const { currentUser, userData, userDataLoaded, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    if (!userDataLoaded) {
      return (
        <div className="container">
          <div className="spinner"></div>
        </div>
      );
    }

    if (!userData || userData.role !== role) {
      const destination = roleRoutes[userData?.role] || '/login';
      return <Navigate to={destination} replace />;
    }
  }

  return children;
}

export default PrivateRoute;

