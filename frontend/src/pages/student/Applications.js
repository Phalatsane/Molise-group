import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StudentApplications() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [qualifiedInstitutions, setQualifiedInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchQualifiedInstitutions();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/student/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifiedInstitutions = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/student/qualified-institutions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQualifiedInstitutions(res.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const handleApply = async (courseId, institutionId) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/student/apply`,
        { courseId, institutionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application submitted successfully!');
      fetchApplications();
      fetchQualifiedInstitutions();
      setShowApply(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to apply');
    }
  };

  const handleSelectAdmission = async (applicationId) => {
    if (!window.confirm('Are you sure you want to select this admission? This will reject other admissions.')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/student/select-admission`,
        { applicationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Admission selected successfully!');
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to select admission');
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
        <h1>My Applications</h1>
        <button className="btn btn-primary" onClick={() => setShowApply(!showApply)}>
          {showApply ? 'Hide Apply' : 'Apply for Course'}
        </button>
      </div>

      {showApply && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Qualified Institutions & Courses</h2>
          {qualifiedInstitutions.length === 0 ? (
            <p>No qualified institutions found. Please add your HEIS results first.</p>
          ) : (
            qualifiedInstitutions.map(inst => (
              <div key={inst.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--gray)', borderRadius: '5px' }}>
                <h3>{inst.name}</h3>
                {inst.qualifiedCourses?.map(course => (
                  <div key={course.id} style={{ marginTop: '10px', padding: '10px', background: 'var(--light-gray)' }}>
                    <strong>{course.name}</strong>
                    <p>{course.description}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApply(course.id, inst.id)}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      <div className="card">
        <h2>Application Status</h2>
        {applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Course</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{app.institution?.name || 'N/A'}</td>
                  <td>{app.course?.name || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>
                    {app.status === 'admitted' && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleSelectAdmission(app.id)}
                      >
                        Select
                      </button>
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

export default StudentApplications;

