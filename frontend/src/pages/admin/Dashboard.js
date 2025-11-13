import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats?.totalUsers || 0}
          </p>
        </div>
        <div className="card">
          <h3>Institutions</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats?.totalInstitutions || 0}
          </p>
        </div>
        <div className="card">
          <h3>Companies</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats?.totalCompanies || 0}
          </p>
        </div>
        <div className="card">
          <h3>Applications</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats?.totalApplications || 0}
          </p>
        </div>
      </div>

      {stats?.usersByRole && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Users by Role</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>Students: {stats.usersByRole.student || 0}</li>
            <li>Institutes: {stats.usersByRole.institute || 0}</li>
            <li>Companies: {stats.usersByRole.company || 0}</li>
            <li>Admins: {stats.usersByRole.admin || 0}</li>
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/admin/institutions" className="btn btn-primary">Manage Institutions</Link>
        <Link to="/admin/faculties" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Manage Faculties</Link>
        <Link to="/admin/courses" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Manage Courses</Link>
        <Link to="/admin/link-institute" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Link Institute</Link>
        <Link to="/admin/companies" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Manage Companies</Link>
        <Link to="/admin/reports" className="btn btn-secondary" style={{ marginLeft: '10px' }}>View Reports</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;

