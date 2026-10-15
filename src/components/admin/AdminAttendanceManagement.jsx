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
      <ClaimReview />
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

function ClaimReview() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [claims, setClaims] = useState([]);
  const [roster, setRoster] = useState([]);
  const [reason, setReason] = useState('Verified in class');

  useEffect(() => {
    adminService.getCourses(0, 100, false).then((data) => setCourses(data.items || [])).catch(() => setCourses([]));
  }, []);

  const load = async () => {
    if (!courseId) return;
    const rows = await adminService.getAttendanceClaims(courseId, new Date(day).toISOString());
    const page = await adminService.getEnrollments(0, 100, 'active', null, true);
    setClaims(rows || []);
    setRoster((page.items || []).filter((item) => item.course_id === courseId));
  };

  const markAbsent = async (enrollment) => {
    if (reason.trim().length < 5) {
      toast.warning('Enter a reason of at least 5 characters');
      return;
    }
    try {
      await adminService.createAttendance({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        enrollment_id: enrollment.id,
        date: new Date(day).toISOString(),
        status: 'absent',
        notes: reason.trim(),
        marked_by: 'session',
      });
      toast.success('Student marked absent');
    } catch (err) {
      const failure = await interpretApiError(err, 'Could not mark the student absent');
      toast.error(failure.message);
    }
  };

  const decide = async (claimId, action) => {
    try {
      await adminService.decideAttendanceClaim(claimId, action, reason);
      toast.success(action === 'approve' ? 'Marked present after verification' : 'Check-in updated');
      load();
    } catch (err) {
      const failure = await interpretApiError(err, 'Could not update the check-in');
      toast.error(failure.message);
    }
  };

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Student check-ins awaiting verification</h3>
      <p className="text-sm text-gray-600 mb-3">Pending check-ins are not official attendance and are not counted as present.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <select className="border rounded px-3 py-2" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="">Course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <Input label="Date" type="date" value={day} onChange={(event) => setDay(event.target.value)} />
        <Button type="button" onClick={load}>Load check-ins</Button>
      </div>
      <Input label="Decision note" value={reason} onChange={(event) => setReason(event.target.value)} />
      {claims.length === 0 ? <p className="text-sm text-gray-500 mt-3">No check-ins for this course and date.</p> : (
        <div className="space-y-2 mt-3">
          {claims.map((claim) => (
            <div key={claim.id} className="flex flex-wrap items-center justify-between gap-2 border rounded p-2">
              <span className="text-sm">Student {claim.student_id.slice(-6)} · {claim.status} · {new Date(claim.submitted_at).toLocaleString()}</span>
              {claim.status === 'pending_verification' && (
                <div className="flex gap-2">
                  <Button type="button" className="text-sm" onClick={() => decide(claim.id, 'approve')}>Approve present</Button>
                  <Button type="button" className="text-sm" onClick={() => decide(claim.id, 'reject')}>Reject check-in</Button>
                  <Button type="button" className="text-sm" onClick={() => decide(claim.id, 'mark_absent')}>Mark absent</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {roster.filter((item) => !claims.some((claim) => claim.student_id === item.student_id)).length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium">Enrolled students with no check-in</p>
          <p className="text-xs text-gray-500">They stay unmarked until you record an official absence. A missing check-in is not treated as absent automatically.</p>
          {roster.filter((item) => !claims.some((claim) => claim.student_id === item.student_id)).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border rounded p-2">
              <span className="text-sm">Student {item.student_id.slice(-6)} · no check-in</span>
              <Button type="button" className="text-sm" onClick={() => markAbsent(item)}>Mark absent</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default AdminAttendanceManagement;
