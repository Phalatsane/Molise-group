import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StudentDashboard() {
  const { currentUser, userData } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    admitted: 0,
    pending: 0,
    jobs: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      
      // Fetch applications
      const appsRes = await axios.get(`${API_URL}/student/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const applications = appsRes.data;
      
      setStats({
        applications: applications.length,
        admitted: applications.filter(a => a.status === 'admitted').length,
        pending: applications.filter(a => a.status === 'pending').length,
        jobs: 0
      });

      // Fetch notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        where('read', '==', false)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      setNotifications(notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      
      {!userData?.heisResultsAdded && (
        <div className="alert alert-info">
          <strong>Important:</strong> Please add your HEIS results before applying for courses.
          <Link to="/student/heis-results" className="btn btn-primary" style={{ marginLeft: '10px' }}>
            Add HEIS Results
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Applications</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
            {stats.applications}
          </p>
        </div>
        <div className="card">
          <h3>Admitted</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success)' }}>
            {stats.admitted}
          </p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--warning)' }}>
            {stats.pending}
          </p>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Notifications</h3>
          {notifications.map(notif => (
            <div key={notif.id} className="alert alert-info" style={{ marginBottom: '10px' }}>
              <strong>{notif.title}</strong>
              <p>{notif.message}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/student/applications" className="btn btn-primary">View Applications</Link>
        <Link to="/student/jobs" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Browse Jobs</Link>
      </div>
    </div>
  );
}

export default StudentDashboard;

