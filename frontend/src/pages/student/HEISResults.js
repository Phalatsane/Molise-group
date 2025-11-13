import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SUBJECTS = [
  'English', 'Mathematics', 'Sesotho', 'Science', 'Biology', 'Chemistry', 
  'Physics', 'Geography', 'History', 'Economics', 'Accounting', 'Business Studies'
];

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

function StudentHEISResults() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData?.heisResults) {
      setResults(userData.heisResults);
    }
  }, [userData]);

  const addResult = () => {
    setResults([...results, { subject: '', grade: '', points: 0 }]);
  };

  const updateResult = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    
    // Calculate points based on grade
    if (field === 'grade') {
      const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
      newResults[index].points = gradePoints[value] || 0;
    }
    
    setResults(newResults);
  };

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/student/heis-results`,
        { results },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUserData();
      setSuccess('HEIS results added successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save HEIS results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Add HEIS Results</h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {results.map((result, index) => (
            <div key={index} style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr auto', 
              gap: '10px', 
              marginBottom: '15px',
              alignItems: 'end'
            }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Subject</label>
                <select
                  className="form-control"
                  value={result.subject}
                  onChange={(e) => updateResult(index, 'subject', e.target.value)}
                  required
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Grade</label>
                <select
                  className="form-control"
                  value={result.grade}
                  onChange={(e) => updateResult(index, 'grade', e.target.value)}
                  required
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Points</label>
                <input
                  type="number"
                  className="form-control"
                  value={result.points}
                  readOnly
                />
              </div>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeResult(index)}
                style={{ height: '38px' }}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addResult}
            style={{ marginBottom: '20px' }}
          >
            Add Subject
          </button>

          {results.length > 0 && (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Results'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default StudentHEISResults;

