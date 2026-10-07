import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { DataState, useCollectionView } from '../common/DataState';

const AdminStudentManagement = () => {
  const [students, setStudents] = useState([]);
  const listView = useCollectionView();
  const [actionError, setActionError] = useState(null);
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
    listView.start();
    try {
      const response = await adminService.getStudents(0, 100);
      const items = response.items || [];
      setStudents(items);
      listView.succeed(items);
    } catch (err) {
      setStudents([]);
      await listView.fail(err, 'Failed to load students');
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
      const failure = await interpretApiError(err, 'Failed to save student');
      setActionError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
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
      const failure = await interpretApiError(err, 'Failed to delete student');
      setActionError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      enrollment_date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <Button onClick={() => { setShowForm(true); setEditingStudent(null); resetForm(); }}>
          + Add Student
        </Button>
      </div>

      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded" role="alert">
          {actionError}
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

      <DataState
        status={listView.status}
        message={listView.message}
        onRetry={loadStudents}
        loading={<div className="text-center py-8">Loading students...</div>}
        empty={(
          <EmptyState
            icon="students"
            title="No student profiles yet"
            description="Add a student profile for an existing user account before enrolling them in a course."
          />
        )}
      >
      <div className="grid gap-4">
          {students.map((student) => (
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
          ))}
      </div>
      </DataState>
    </div>
  );
};

export default AdminStudentManagement;
