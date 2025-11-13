import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminLinkInstitute() {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [instituteUsers, setInstituteUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    institutionId: ''
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      const [institutionsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/institutions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setInstitutions(institutionsRes.data);
      
      // Fetch institute users from Firestore (would need a new endpoint)
      // For now, we'll use a placeholder
      setInstituteUsers([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/admin/institutions/${formData.institutionId}/link-institute`,
        { userId: formData.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Institute linked to institution successfully!');
      setFormData({ userId: '', institutionId: '' });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to link institute');
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>Link Institute to Institution</h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Institute User Email/ID</label>
            <input
              type="text"
              className="form-control"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="Enter user email or UID"
              required
            />
            <small className="form-text text-muted">
              Enter the email address or UID of the institute user account
            </small>
          </div>
          <div className="form-group">
            <label>Institution</label>
            <select
              className="form-control"
              value={formData.institutionId}
              onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
              required
            >
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Link Institute</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Instructions</h2>
        <ol>
          <li>Find the institute user account email or UID from the users collection</li>
          <li>Select the institution to link the institute account to</li>
          <li>Click "Link Institute" to complete the linking</li>
          <li>Once linked, the institute user will be able to manage that institution's data</li>
        </ol>
      </div>
    </div>
  );
}

export default AdminLinkInstitute;

