import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

function CompanyDashboard() {
  const { currentUser, userData } = useAuth();
  const [stats, setStats] = useState({
    jobs: 0,
    applicants: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/company/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        jobs: res.data.length,
        applicants: 0 // Would need to calculate from all jobs
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
      <h1>Company Dashboard</h1>
      
      {userData?.status !== 'approved' && (
        <div className="alert alert-warning">
          <strong>Notice:</strong> Your account is pending approval. You cannot post jobs until approved.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Active Jobs</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats.jobs}
          </p>
        </div>
        <div className="card">
          <h3>Total Applicants</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats.applicants}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/company/jobs" className="btn btn-primary">Manage Jobs</Link>
        <Link to="/company/profile" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Update Profile</Link>
      </div>
    </div>
  );
}

export default CompanyDashboard;

