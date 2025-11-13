import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleRoutes = () => {
    if (!userData) return [];
    
    const routes = {
      admin: [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/institutions', label: 'Institutions' },
        { path: '/admin/faculties', label: 'Faculties' },
        { path: '/admin/courses', label: 'Courses' },
        { path: '/admin/companies', label: 'Companies' },
        { path: '/admin/reports', label: 'Reports' }
      ],
      institute: [
        { path: '/institute', label: 'Dashboard' },
        { path: '/institute/faculties', label: 'Faculties' },
        { path: '/institute/courses', label: 'Courses' },
        { path: '/institute/applications', label: 'Applications' },
        { path: '/institute/profile', label: 'Profile' }
      ],
      student: [
        { path: '/student', label: 'Dashboard' },
        { path: '/student/heis-results', label: 'HEIS Results' },
        { path: '/student/applications', label: 'Applications' },
        { path: '/student/jobs', label: 'Jobs' },
        { path: '/student/profile', label: 'Profile' }
      ],
      company: [
        { path: '/company', label: 'Dashboard' },
        { path: '/company/jobs', label: 'Jobs' },
        { path: '/company/profile', label: 'Profile' }
      ]
    };

    return routes[userData.role] || [];
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          Career Guidance Platform
        </Link>
        {currentUser ? (
          <ul className="navbar-nav">
            {getRoleRoutes().map((route) => (
              <li key={route.path}>
                <Link to={route.path}>{route.label}</Link>
              </li>
            ))}
            <li>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ margin: 0 }}>
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul className="navbar-nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#roles">Roles</a>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

