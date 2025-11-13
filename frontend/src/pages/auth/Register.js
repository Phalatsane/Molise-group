import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    name: '',
    institutionName: '', // for institute
    companyName: '' // for company
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const additionalData = {};
      if (formData.role === 'institute') {
        additionalData.institutionName = formData.institutionName;
      } else if (formData.role === 'company') {
        additionalData.companyName = formData.companyName;
      } else if (formData.role === 'student' || formData.role === 'admin') {
        additionalData.name = formData.name;
      }

      await register(formData.email, formData.password, formData.role, additionalData);
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      <div className="card">
        <div className="card-header">
          <h2>Register</h2>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="institute">Institute</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {(formData.role === 'student' || formData.role === 'admin') && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {formData.role === 'institute' && (
            <div className="form-group">
              <label>Institution Name</label>
              <input
                type="text"
                name="institutionName"
                className="form-control"
                value={formData.institutionName}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {formData.role === 'company' && (
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
          )}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary-blue)' }}>Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;

