import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import { DataState, useCollectionView } from '../common/DataState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Card from '../common/Card';
import Input from '../common/Input';
import AttendanceCorrectionList from './AttendanceCorrectionList';

const AdminAttendanceManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const listView = useCollectionView();
  const { start, succeed, fail } = listView;
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    enrollment_id: '',
    date: new Date().toISOString().slice(0, 16),
    status: 'present',
    notes: '',
    is_excused: false,
  });

  const loadData = useCallback(async () => {
    start();
    try {
      setLoading(true);
      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        adminService.getStudents(0, 100),
        adminService.getCourses(0, 100, false),
        adminService.getEnrollments(0, 100, 'active', null, 'true'),
      ]);
      setStudents(studentsData.items || []);
      setCourses(coursesData.items || []);
      const items = enrollmentsData.items || [];
      setEnrollments(items);
      succeed(items);
    } catch (err) {
      setStudents([]);
      setCourses([]);
      setEnrollments([]);
      await fail(err, 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [start, succeed, fail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStudentChange = (studentId) => {
    const enrollment = enrollments.find((e) => e.student_id === studentId);
    setFormData((prev) => ({
      ...prev,
      student_id: studentId,
      course_id: enrollment?.course_id || '',
      enrollment_id: enrollment?.id || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.course_id || !formData.enrollment_id) {
      toast.error('Select a student with an active verified enrollment');
      return;
    }
    try {
      await adminService.createAttendance({
        ...formData,
        date: new Date(formData.date).toISOString(),
        marked_by: user.id,
      });
      toast.success('Attendance marked');
      setShowForm(false);
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to mark attendance');
      toast.error(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading attendance...</div>;
  if (listView.status === 'error' || listView.status === 'denied') {
    return <DataState status={listView.status} message={listView.message} onRetry={loadData} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        {enrollments.length > 0 && (
          <Button onClick={() => setShowForm(!showForm)}>+ Mark Attendance</Button>
        )}
      </div>
      {enrollments.length === 0 && (
        <EmptyState
          icon="default"
          title="No verified enrollments"
          description="Verify an active enrollment before marking attendance for a student."
        />
      )}

      {showForm && enrollments.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select className="w-full border rounded px-3 py-2" value={formData.student_id} onChange={(e) => handleStudentChange(e.target.value)} required>
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>Student {s.id.slice(-6)} (User: {s.user_id.slice(-6)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <select className="w-full border rounded px-3 py-2" value={formData.course_id} onChange={(e) => {
                const courseId = e.target.value;
                const enrollment = enrollments.find((en) => en.student_id === formData.student_id && en.course_id === courseId);
                setFormData((prev) => ({ ...prev, course_id: courseId, enrollment_id: enrollment?.id || '' }));
              }} required>
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <Input label="Date & Time" type="datetime-local" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded px-3 py-2" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
            <Input label="Notes" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_excused} onChange={(e) => setFormData((p) => ({ ...p, is_excused: e.target.checked }))} />
              <span className="text-sm">Excused absence</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Correction requests</h3>
        <AttendanceCorrectionList />
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">
          Mark attendance for verified enrollments. Absent/late records automatically update scholarship absence counts and may trigger notifications.
        </p>
      </Card>
    </div>
  );
};

export default AdminAttendanceManagement;
