import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function InstituteFaculties() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchFaculties();
    }
  }, [currentUser]);

  const fetchFaculties = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/institute/faculties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaculties(res.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
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
          `${API_URL}/institute/faculties/${editing.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/institute/faculties`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchFaculties();
      await refreshUserData();
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save faculty');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/institute/faculties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFaculties();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete faculty');
    }
  };

  const handleEdit = (faculty) => {
    setEditing(faculty);
    setFormData({ name: faculty.name, description: faculty.description || '' });
    setShowForm(true);
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Faculties</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ name: '', description: '' }); }}>
          {showForm ? 'Cancel' : 'Add Faculty'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>{editing ? 'Edit' : 'Add'} Faculty</h2>
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
              <label>Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Faculties List</h2>
        {faculties.length === 0 ? (
          <p>No faculties found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map(faculty => (
                <tr key={faculty.id}>
                  <td>{faculty.name}</td>
                  <td>{faculty.description || 'N/A'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(faculty)} style={{ marginRight: '10px' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(faculty.id)}>
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

export default InstituteFaculties;

