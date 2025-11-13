import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

function InstituteCourses() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facultyId: '',
    requirements: {
      minPoints: '',
      subjects: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      const [coursesRes, facultiesRes] = await Promise.all([
        axios.get(`${API_URL}/institute/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/institute/faculties`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(coursesRes.data);
      setFaculties(facultiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const courseData = {
        ...formData,
        requirements: {
          minPoints: parseInt(formData.requirements.minPoints) || 0,
          subjects: formData.requirements.subjects
        }
      };
      
      if (editing) {
        await axios.put(
          `${API_URL}/institute/courses/${editing.id}`,
          courseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/institute/courses`,
          courseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchData();
      setShowForm(false);
      setEditing(null);
      setFormData({
        name: '',
        description: '',
        facultyId: '',
        requirements: { minPoints: '', subjects: [] }
      });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save course');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/institute/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleEdit = (course) => {
    setEditing(course);
    setFormData({
      name: course.name,
      description: course.description || '',
      facultyId: course.facultyId,
      requirements: course.requirements || { minPoints: '', subjects: [] }
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Courses</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ name: '', description: '', facultyId: '', requirements: { minPoints: '', subjects: [] } }); }}>
          {showForm ? 'Cancel' : 'Add Course'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>{editing ? 'Edit' : 'Add'} Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Faculty</label>
              <select
                className="form-control"
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Course Name</label>
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
            <div className="form-group">
              <label>Minimum Points Required</label>
              <input
                type="number"
                className="form-control"
                value={formData.requirements.minPoints}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, minPoints: e.target.value }
                })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Courses List</h2>
        {courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Description</th>
                <th>Min Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.description || 'N/A'}</td>
                  <td>{course.requirements?.minPoints || 'N/A'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(course)} style={{ marginRight: '10px' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(course.id)}>
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

export default InstituteCourses;

