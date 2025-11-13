import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

function InstituteApplications() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/institute/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/institute/applications/${applicationId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handlePublishAdmissions = async () => {
    if (!window.confirm('Are you sure you want to publish admissions? This will notify all students.')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/institute/publish-admissions`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Admissions published successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to publish admissions');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      admitted: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Student Applications</h1>
        <button className="btn btn-primary" onClick={handlePublishAdmissions}>
          Publish Admissions
        </button>
      </div>

      <div className="card">
        {applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{app.student?.name || app.student?.email || 'N/A'}</td>
                  <td>{app.course?.name || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>
                    {app.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => handleStatusUpdate(app.id, 'admitted')}
                          style={{ marginRight: '10px' }}
                        >
                          Admit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InstituteApplications;

