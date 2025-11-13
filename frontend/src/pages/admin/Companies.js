import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

function AdminCompanies() {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/admin/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/admin/companies/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve company');
    }
  };

  const handleSuspend = async (id) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/admin/companies/${id}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to suspend company');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/admin/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete company');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'badge-success',
      pending: 'badge-warning',
      suspended: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>Manage Companies</h1>
      <div className="card">
        <h2>Companies List</h2>
        {companies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <React.Fragment key={company.id}>
                  <tr>
                  <td>{company.companyName || company.name || 'N/A'}</td>
                  <td>{company.email || 'N/A'}</td>
                  <td>{company.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(company.status)}`}>
                      {company.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-info" 
                      onClick={() => setShowDetails(showDetails === company.id ? null : company.id)}
                      style={{ marginRight: '10px' }}
                    >
                      {showDetails === company.id ? 'Hide' : 'View'} Details
                    </button>
                    {company.status !== 'approved' && (
                      <button className="btn btn-success" onClick={() => handleApprove(company.id)} style={{ marginRight: '10px' }}>
                        Approve
                      </button>
                    )}
                    {company.status !== 'suspended' && (
                      <button className="btn btn-warning" onClick={() => handleSuspend(company.id)} style={{ marginRight: '10px' }}>
                        Suspend
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => handleDelete(company.id)}>
                      Delete
                    </button>
                  </td>
                  </tr>
                  {showDetails === company.id && (
                  <tr>
                    <td colSpan="5" style={{ backgroundColor: 'var(--light-gray)', padding: '15px' }}>
                      <div>
                        <h4>Company Details</h4>
                        <p><strong>Address:</strong> {company.address || 'N/A'}</p>
                        <p><strong>Description:</strong> {company.description || 'N/A'}</p>
                        <p><strong>Website:</strong> {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a> : 'N/A'}</p>
                        <p><strong>Registered:</strong> {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}</p>
                        {company.approvedAt && (
                          <p><strong>Approved:</strong> {new Date(company.approvedAt).toLocaleDateString()}</p>
                        )}
                        {company.suspendedAt && (
                          <p><strong>Suspended:</strong> {new Date(company.suspendedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminCompanies;

