import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminInstitutions() {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    location: '', 
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/admin/institutions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(res.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      if (editing) {
        await axios.put(
          `${API_URL}/admin/institutions/${editing.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/institutions`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchInstitutions();
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', location: '', description: '', website: '', contactEmail: '', contactPhone: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save institution');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this institution?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/admin/institutions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInstitutions();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete institution');
    }
  };

  const handleEdit = (inst) => {
    setEditing(inst);
    setFormData({ 
      name: inst.name, 
      location: inst.location || '', 
      description: inst.description || '',
      website: inst.website || '',
      contactEmail: inst.contactEmail || '',
      contactPhone: inst.contactPhone || ''
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Institutions</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ name: '', location: '', description: '', website: '', contactEmail: '', contactPhone: '' }); }}>
          {showForm ? 'Cancel' : 'Add Institution'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>{editing ? 'Edit' : 'Add'} Institution</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                className="form-control"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Institutions List</h2>
        {institutions.length === 0 ? (
          <p>No institutions found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Contact Email</th>
                <th>Contact Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst => (
                <tr key={inst.id}>
                  <td>{inst.name}</td>
                  <td>{inst.location || 'N/A'}</td>
                  <td>{inst.contactEmail || 'N/A'}</td>
                  <td>{inst.contactPhone || 'N/A'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(inst)} style={{ marginRight: '10px' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(inst.id)}>
                      Delete
                    </button>
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

export default AdminInstitutions;

