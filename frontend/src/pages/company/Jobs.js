import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CompanyJobs() {
  const { currentUser, userData } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    requirements: {
      minGPA: '',
      requiredCertificates: [],
      minExperienceYears: '',
      description: ''
    }
  });
  const [certsInput, setCertsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/company/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
      const jobData = {
        ...formData,
        companyName: userData.companyName,
        requirements: {
          ...formData.requirements,
          minGPA: parseFloat(formData.requirements.minGPA) || 0,
          minExperienceYears: parseInt(formData.requirements.minExperienceYears) || 0,
          requiredCertificates: certsInput
            ? certsInput.split(',').map(c => c.trim()).filter(Boolean)
            : []
        }
      };
      
      if (!jobData.title || !jobData.description) {
        setError('Title and description are required.');
        return;
      }

      if (editing) {
        await axios.put(
          `${API_URL}/company/jobs/${editing.id}`,
          jobData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/company/jobs`,
          jobData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchJobs();
      setShowForm(false);
      setEditing(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        requirements: { minGPA: '', requiredCertificates: [], minExperienceYears: '', description: '' }
      });
      setCertsInput('');
      setSuccess(editing ? 'Job updated successfully!' : 'Job posted successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save job');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/company/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete job');
    }
  };

  const handleEdit = (job) => {
    setEditing(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      location: job.location || '',
      requirements: job.requirements || { minGPA: '', requiredCertificates: [], minExperienceYears: '', description: '' }
    });
    setCertsInput(
      (job.requirements?.requiredCertificates || []).join(', ')
    );
    setShowForm(true);
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Jobs</h1>
        {userData?.status === 'approved' && (
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ title: '', description: '', location: '', requirements: { minGPA: '', requiredCertificates: [], minExperienceYears: '', description: '' } }); }}>
            {showForm ? 'Cancel' : 'Post Job'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>{editing ? 'Edit' : 'Post'} Job</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="5"
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
              <label>Minimum GPA</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.requirements.minGPA}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, minGPA: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>Minimum Experience (Years)</label>
              <input
                type="number"
                className="form-control"
                value={formData.requirements.minExperienceYears}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, minExperienceYears: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>Required Certificates (comma separated)</label>
              <input
                type="text"
                className="form-control"
                value={certsInput}
                onChange={(e) => setCertsInput(e.target.value)}
                placeholder="e.g., AWS Certified, Cisco CCNA"
              />
            </div>
            <div className="form-group">
              <label>Requirements Description</label>
              <textarea
                className="form-control"
                value={formData.requirements.description}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, description: e.target.value }
                })}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Posted Jobs</h2>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map(job => (
            <div key={job.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--gray)', borderRadius: '5px' }}>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p><strong>Location:</strong> {job.location || 'N/A'}</p>
              <p><strong>Status:</strong> <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{job.status}</span></p>
              <div style={{ marginTop: '10px' }}>
                <Link to={`/company/applicants/${job.id}`} className="btn btn-primary" style={{ marginRight: '10px' }}>
                  View Applicants
                </Link>
                <button className="btn btn-secondary" onClick={() => handleEdit(job)} style={{ marginRight: '10px' }}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(job.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CompanyJobs;

