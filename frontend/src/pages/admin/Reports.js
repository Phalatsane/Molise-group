import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminReports() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>System Reports</h1>
      
      <div className="card">
        <h2>Overview Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <h3>Total Users</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {reports?.totalUsers || 0}
            </p>
          </div>
          <div>
            <h3>Total Institutions</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {reports?.totalInstitutions || 0}
            </p>
          </div>
          <div>
            <h3>Total Companies</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {reports?.totalCompanies || 0}
            </p>
          </div>
          <div>
            <h3>Total Applications</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
              {reports?.totalApplications || 0}
            </p>
          </div>
        </div>
      </div>

      {reports?.usersByRole && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>Users by Role</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Students</td>
                <td>{reports.usersByRole.student || 0}</td>
              </tr>
              <tr>
                <td>Institutes</td>
                <td>{reports.usersByRole.institute || 0}</td>
              </tr>
              <tr>
                <td>Companies</td>
                <td>{reports.usersByRole.company || 0}</td>
              </tr>
              <tr>
                <td>Admins</td>
                <td>{reports.usersByRole.admin || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminReports;

