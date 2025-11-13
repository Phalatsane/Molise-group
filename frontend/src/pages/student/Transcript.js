import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StudentTranscript() {
  const { currentUser, refreshUserData } = useAuth();
  const [results, setResults] = useState([{ subject: '', score: '' }]);
  const [certificates, setCertificates] = useState([{ name: '', url: '' }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleResultChange = (index, field, value) => {
    const updated = [...results];
    updated[index][field] = value;
    setResults(updated);
  };

  const addResult = () => {
    setResults([...results, { subject: '', score: '' }]);
  };

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleCertificateChange = (index, field, value) => {
    const updated = [...certificates];
    updated[index][field] = value;
    setCertificates(updated);
  };

  const addCertificate = () => {
    setCertificates([...certificates, { name: '', url: '' }]);
  };

  const removeCertificate = (index) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const filteredResults = results.filter(r => r.subject && r.score);
      const filteredCertificates = certificates.filter(c => c.name && c.url);

      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/student/upload-transcript`,
        {
          transcriptEntries: filteredResults,
          additionalCertificates: filteredCertificates
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await refreshUserData();
      setSuccess('Academic results and certificates saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Academic Results & Certificates</h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentTranscript;

