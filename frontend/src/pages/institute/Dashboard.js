import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

function InstituteDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    faculties: 0,
    courses: 0,
    applications: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await currentUser.getIdToken();
      
      const [facultiesRes, coursesRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/institute/faculties`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/institute/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/institute/applications`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats({
        faculties: facultiesRes.data.length,
        courses: coursesRes.data.length,
        applications: appsRes.data.length,
        pending: appsRes.data.filter(a => a.status === 'pending').length
      });
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
      <h1>Institute Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Faculties</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats.faculties}
          </p>
        </div>
        <div className="card">
          <h3>Courses</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats.courses}
          </p>
        </div>
        <div className="card">
          <h3>Applications</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats.applications}
          </p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--warning)' }}>
            {stats.pending}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/institute/faculties" className="btn btn-primary">Manage Faculties</Link>
        <Link to="/institute/courses" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Manage Courses</Link>
        <Link to="/institute/applications" className="btn btn-secondary" style={{ marginLeft: '10px' }}>View Applications</Link>
      </div>
    </div>
  );
}

export default InstituteDashboard;

