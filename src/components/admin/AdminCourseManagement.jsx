import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { DataState, useCollectionView } from '../common/DataState';

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const listView = useCollectionView();
  const { start, succeed, fail } = listView;
  const [actionError, setActionError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_id: '',
    duration_hours: 0,
    price: 0,
    is_published: false,
  });

  const loadCourses = useCallback(async () => {
    start();
    try {
      const response = await adminService.getCourses(0, 100, false);
      const items = response.items || [];
      setCourses(items);
      succeed(items);
    } catch (err) {
      setCourses([]);
      await fail(err, 'Failed to load courses');
    }
  }, [start, succeed, fail]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.id, formData);
      } else {
        await adminService.createCourse(formData);
      }
      setShowForm(false);
      setEditingCourse(null);
      resetForm();
      loadCourses();
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to save course');
      setActionError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor_id: course.instructor_id,
      duration_hours: course.duration_hours,
      price: course.price,
      is_published: course.is_published,
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    try {
      await adminService.deleteCourse(courseId);
      loadCourses();
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to delete course');
      setActionError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor_id: '',
      duration_hours: 0,
      price: 0,
      is_published: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <Button onClick={() => { setShowForm(true); setEditingCourse(null); resetForm(); }}>
          + Add Course
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
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor_id}
                  onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
              <Button
                type="button"
                onClick={() => { setShowForm(false); setEditingCourse(null); resetForm(); }}
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
        onRetry={loadCourses}
        loading={<div className="text-center py-8">Loading courses...</div>}
        empty={(
          <EmptyState
            icon="courses"
            title="No courses yet"
            description="Add a course, then publish it when students should be able to enroll."
          />
        )}
      >
      <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                    {course.is_published && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Published
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Duration: {course.duration_hours} hours</span>
                    <span>Price: Rs. {course.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleEdit(course)}
                    className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(course.id)}
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

export default AdminCourseManagement;
