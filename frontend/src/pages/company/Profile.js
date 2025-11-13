import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CompanyProfile() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [companyDoc, setCompanyDoc] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: '',
    industry: '',
    companySize: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/company/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompanyDoc(response.data);
      } catch (err) {
        console.error('Failed to fetch company profile', err);
      }
    };

    loadCompanyProfile();
  }, [currentUser]);

  useEffect(() => {
    if (userData || companyDoc) {
      setFormData({
        companyName: companyDoc?.companyName || userData?.companyName || '',
        email: userData?.email || '',
        phone: companyDoc?.phone || userData?.phone || '',
        address: companyDoc?.address || userData?.address || '',
        description: companyDoc?.description || userData?.description || '',
        website: companyDoc?.website || userData?.website || '',
        industry: companyDoc?.industry || userData?.industry || '',
        companySize: companyDoc?.companySize || userData?.companySize || ''
      });
    }
  }, [userData, companyDoc]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/company/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUserData();
      await (async () => {
        try {
          const tokenRefresh = await currentUser.getIdToken(true);
          const response = await axios.get(`${API_URL}/company/profile`, {
            headers: { Authorization: `Bearer ${tokenRefresh}` }
          });
          setCompanyDoc(response.data);
        } catch (err) {
          console.error('Failed to refresh company profile', err);
        }
      })();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Company Profile</h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              className="form-control"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              className="form-control"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              className="form-control"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g., Technology, Finance, Healthcare"
            />
          </div>
          <div className="form-group">
            <label>Company Size</label>
            <select
              name="companySize"
              className="form-control"
              value={formData.companySize}
              onChange={handleChange}
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe your company, its mission, and values"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompanyProfile;

