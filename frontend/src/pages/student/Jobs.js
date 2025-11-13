import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StudentJobs() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationJob, setApplicationJob] = useState(null);
  const [results, setResults] = useState([{ subject: '', score: '' }]);
  const [certificates, setCertificates] = useState([{ name: '', url: '' }]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/student/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/student/job-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyApplications(res.data.map(app => app.jobId));
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const openApplicationForm = (job) => {
    setApplicationJob(job);
    setFormError('');
    setFormSuccess('');
    if (userData?.transcriptEntries && userData.transcriptEntries.length > 0) {
      setResults(userData.transcriptEntries.map(entry => ({
        subject: entry.subject || '',
        score: entry.score || ''
      })));
    } else {
      setResults([{ subject: '', score: '' }]);
    }

    if (userData?.additionalCertificates && userData.additionalCertificates.length > 0) {
      setCertificates(userData.additionalCertificates.map(cert => ({
        name: cert.name || '',
        url: cert.url || ''
      })));
    } else {
      setCertificates([{ name: '', url: '' }]);
    }
  };

  const closeApplicationForm = () => {
    setApplicationJob(null);
    setFormError('');
    setFormSuccess('');
    setResults([{ subject: '', score: '' }]);
    setCertificates([{ name: '', url: '' }]);
  };

  const handleResultChange = (index, field, value) => {
    const updated = [...results];
    updated[index][field] = value;
    setResults(updated);
  };

  const addResult = () => setResults([...results, { subject: '', score: '' }]);
  const removeResult = (index) => setResults(results.filter((_, i) => i !== index));

  const handleCertificateChange = (index, field, value) => {
    const updated = [...certificates];
    updated[index][field] = value;
    setCertificates(updated);
  };

  const addCertificate = () => setCertificates([...certificates, { name: '', url: '' }]);
  const removeCertificate = (index) => setCertificates(certificates.filter((_, i) => i !== index));

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!applicationJob) return;
    setApplying(true);
    setFormError('');
    setFormSuccess('');

    try {
      const filteredResults = results.filter(r => r.subject && r.score);
      if (filteredResults.length === 0) {
        setFormError('Please provide at least one academic result.');
        setApplying(false);
        return;
      }

      const filteredCerts = certificates.filter(c => c.name && c.url);

      const token = await currentUser.getIdToken();

      await axios.post(
        `${API_URL}/student/upload-transcript`,
        {
          transcriptEntries: filteredResults,
          additionalCertificates: filteredCerts
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await refreshUserData();

      await axios.post(
        `${API_URL}/student/jobs/${applicationJob.id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormSuccess('Application submitted successfully!');
      await fetchMyApplications();
      setTimeout(() => {
        closeApplicationForm();
      }, 1500);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>Available Jobs</h1>
      {jobs.length === 0 ? (
        <div className="card">
          <p>No jobs available at the moment.</p>
        </div>
      ) : (
        jobs.map(job => (
          <div key={job.id} className="card">
            <h2>{job.title}</h2>
            <p><strong>Company:</strong> {job.companyName}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Requirements:</strong> {job.requirements?.description || 'N/A'}</p>
            <p><strong>Location:</strong> {job.location || 'N/A'}</p>
            <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
            {job.requirements && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-dark)' }}>
                <p><strong>Min GPA:</strong> {job.requirements.minGPA || 'N/A'}</p>
                <p><strong>Min Experience:</strong> {job.requirements.minExperienceYears || 0} year(s)</p>
                {job.requirements.requiredCertificates && job.requirements.requiredCertificates.length > 0 && (
                  <p><strong>Required Certificates:</strong> {job.requirements.requiredCertificates.join(', ')}</p>
                )}
              </div>
            )}
            {myApplications.includes(job.id) ? (
              <span className="badge badge-info">Applied</span>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => openApplicationForm(job)}
              >
                Apply
              </button>
            )}
          </div>
        ))
      )}

      {applicationJob && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Apply for {applicationJob.title}</h2>
          {formError && <div className="alert alert-error">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
          <form onSubmit={submitApplication}>
            <h3>Academic Results</h3>
            {results.map((result, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '15px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={result.subject}
                    onChange={(e) => handleResultChange(index, 'subject', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Score / Grade</label>
                  <input
                    type="text"
                    className="form-control"
                    value={result.score}
                    onChange={(e) => handleResultChange(index, 'score', e.target.value)}
                    required
                  />
                </div>
                <button type="button" className="btn btn-danger" onClick={() => removeResult(index)} style={{ height: '38px' }}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addResult} style={{ marginBottom: '20px' }}>
              Add Result
            </button>

            <h3>Professional Certificates</h3>
            {certificates.map((cert, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '15px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Certificate Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cert.name}
                    onChange={(e) => handleCertificateChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Certificate URL / Reference</label>
                  <input
                    type="url"
                    className="form-control"
                    value={cert.url}
                    onChange={(e) => handleCertificateChange(index, 'url', e.target.value)}
                    placeholder="https://example.com/certificate"
                    required
                  />
                </div>
                <button type="button" className="btn btn-danger" onClick={() => removeCertificate(index)} style={{ height: '38px' }}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addCertificate} style={{ marginBottom: '20px' }}>
              Add Certificate
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeApplicationForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudentJobs;

