import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CompanyApplicants() {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchApplicants();
    }
  }, [jobId, currentUser]);

  const fetchApplicants = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/company/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <h1>Job Applicants</h1>
      <div className="card">
        {applicants.length === 0 ? (
          <p>No applicants found for this job yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Academic Results</th>
                <th>Certificates</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant, index) => (
                <tr key={index}>
                  <td>{applicant.student?.name || 'N/A'}</td>
                  <td>{applicant.student?.email || 'N/A'}</td>
                  <td>
                    <span className="badge badge-info">{Math.round(applicant.matchScore)}%</span>
                  </td>
                  <td>
                    <span className={`badge ${applicant.isQualified ? 'badge-success' : 'badge-warning'}`}>
                      {applicant.isQualified ? 'Qualified' : 'Consider - Requirements Missing'}
                    </span>
                  </td>
                  <td>
                    {applicant.student?.transcriptEntries?.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {applicant.student.transcriptEntries.map((entry, i) => (
                          <li key={i}>{entry.subject}: {entry.score}</li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </td>
                  <td>
                    {applicant.student?.additionalCertificates?.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {applicant.student.additionalCertificates.map((cert, i) => (
                          <li key={i}>
                            {cert.url ? (
                              <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                {cert.name}
                              </a>
                            ) : cert.name}
                          </li>
                        ))}
                      </ul>
                    ) : 'None'}
                  </td>
                  <td>{new Date(applicant.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CompanyApplicants;

