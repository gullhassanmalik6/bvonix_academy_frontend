import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../common/Button';
import Card from '../common/Card';

const AdminStudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStudents(0, 100);
      setStudents(response.items || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await adminService.updateStudent(editingStudent.id, formData);
      } else {
        await adminService.createStudent(formData);
      }
      setShowForm(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      user_id: student.user_id,
      enrollment_date: student.enrollment_date 
        ? new Date(student.enrollment_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    try {
      await adminService.deleteStudent(studentId);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      enrollment_date: new Date().toISOString().split('T')[0],
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <Button onClick={() => { setShowForm(true); setEditingStudent(null); resetForm(); }}>
          + Add Student
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingStudent ? 'Edit Student' : 'Create New Student'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Date
              </label>
              <input
                type="date"
                required
                value={formData.enrollment_date}
                onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit">
                {editingStudent ? 'Update Student' : 'Create Student'}
              </Button>
              <Button
                type="button"
                onClick={() => { setShowForm(false); setEditingStudent(null); resetForm(); }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {students.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No students found</p>
          </Card>
        ) : (
          students.map((student) => (
            <Card key={student.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Student #{student.id.slice(-8)}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Enrollment: {new Date(student.enrollment_date).toLocaleDateString()}
                    </span>
                    <span>
                      Courses: {student.enrolled_courses?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleEdit(student)}
                    className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(student.id)}
                    className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminStudentManagement;
