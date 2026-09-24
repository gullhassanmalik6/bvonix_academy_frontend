import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../common/Button';
import Card from '../common/Card';

const AdminInstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    bio: '',
    specialization: '',
    years_of_experience: 0,
  });

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const response = await adminService.getInstructors(0, 100);
      setInstructors(response.items || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstructor) {
        await adminService.updateInstructor(editingInstructor.id, formData);
      } else {
        await adminService.createInstructor(formData);
      }
      setShowForm(false);
      setEditingInstructor(null);
      resetForm();
      loadInstructors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save instructor');
    }
  };

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      user_id: instructor.user_id,
      bio: instructor.bio || '',
      specialization: instructor.specialization || '',
      years_of_experience: instructor.years_of_experience || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (instructorId) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) {
      return;
    }
    try {
      await adminService.deleteInstructor(instructorId);
      loadInstructors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete instructor');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      bio: '',
      specialization: '',
      years_of_experience: 0,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading instructors...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Instructor Management</h2>
        <Button onClick={() => { setShowForm(true); setEditingInstructor(null); resetForm(); }}>
          + Add Instructor
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
            {editingInstructor ? 'Edit Instructor' : 'Create New Instructor'}
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
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit">
                {editingInstructor ? 'Update Instructor' : 'Create Instructor'}
              </Button>
              <Button
                type="button"
                onClick={() => { setShowForm(false); setEditingInstructor(null); resetForm(); }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {instructors.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No instructors found</p>
          </Card>
        ) : (
          instructors.map((instructor) => (
            <Card key={instructor.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Instructor #{instructor.id.slice(-8)}
                  </h3>
                  {instructor.bio && (
                    <p className="text-gray-600 mb-2">{instructor.bio}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {instructor.specialization && (
                      <span>Specialization: {instructor.specialization}</span>
                    )}
                    {instructor.years_of_experience && (
                      <span>Experience: {instructor.years_of_experience} years</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleEdit(instructor)}
                    className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(instructor.id)}
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

export default AdminInstructorManagement;
