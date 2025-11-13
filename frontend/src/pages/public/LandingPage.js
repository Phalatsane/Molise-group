import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const roleRoutes = {
  admin: '/admin',
  institute: '/institute',
  student: '/student',
  company: '/company'
};

function LandingPage() {
  const { currentUser, userData, userDataLoaded, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser && userDataLoaded && userData?.role) {
      const destination = roleRoutes[userData.role] || '/login';
      navigate(destination, { replace: true });
    }
  }, [currentUser, userData, userDataLoaded, loading, navigate]);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--light-blue))', color: 'var(--white)', padding: '80px 20px' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 450px' }}>
            <h1 style={{ fontSize: '42px', marginBottom: '20px' }}>Career Guidance & Employment Integration Platform</h1>
            <p style={{ fontSize: '18px', lineHeight: 1.6 }}>
              Empowering students in Lesotho to discover institutions, apply for courses, and connect with employers for career opportunities.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          </div>
          <div style={{ flex: '1 1 300px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', borderRadius: '12px' }}>
            <h3>Why choose us?</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', lineHeight: 1.8 }}>
              <li>Central platform for all Lesotho institutions</li>
              <li>Smart course matching based on HEIS results</li>
              <li>Automated admission management</li>
              <li>Graduate-to-employer connection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container" style={{ padding: '60px 20px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '40px' }}>Platform Highlights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ minHeight: '220px' }}>
            <h3>Centralized Admissions</h3>
            <p>Students apply to multiple institutions in one place with eligibility checks and application tracking.</p>
          </div>
          <div className="card" style={{ minHeight: '220px' }}>
            <h3>Automated Notifications</h3>
            <p>Real-time notifications for admissions, job matches, and status updates for all user roles.</p>
          </div>
          <div className="card" style={{ minHeight: '220px' }}>
            <h3>Graduate Employment</h3>
            <p>Graduates upload transcripts and certificates to connect with verified partner companies.</p>
          </div>
          <div className="card" style={{ minHeight: '220px' }}>
            <h3>Role-Based Dashboards</h3>
            <p>Customized experiences for administrators, institutions, students, and companies.</p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" style={{ backgroundColor: 'var(--light-gray)', padding: '60px 20px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '40px' }}>Who is this platform for?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ minHeight: '200px' }}>
              <span className="badge badge-info">Students</span>
              <h3>Students</h3>
              <p>Discover courses, apply to institutions, track admissions, and connect with employers.</p>
            </div>
            <div className="card" style={{ minHeight: '200px' }}>
              <span className="badge badge-info">Institutions</span>
              <h3>Institutions</h3>
              <p>Publish programmes, manage applications, and streamline admissions decisions.</p>
            </div>
            <div className="card" style={{ minHeight: '200px' }}>
              <span className="badge badge-info">Companies</span>
              <h3>Companies</h3>
              <p>Post job opportunities, review qualified graduates, and hire with confidence.</p>
            </div>
            <div className="card" style={{ minHeight: '200px' }}>
              <span className="badge badge-info">Administrators</span>
              <h3>Administrators</h3>
              <p>Oversee institutions, companies, and system activity with powerful management tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', color: 'var(--primary-blue)', marginBottom: '20px' }}>Ready to get started?</h2>
        <p style={{ marginBottom: '30px', fontSize: '18px' }}>Create an account today and take the next step in your academic and professional journey.</p>
        <Link to="/register" className="btn btn-primary">Create Account</Link>
      </section>
    </div>
  );
}

export default LandingPage;

