import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

const AdminScholarshipManagement = () => {
  const toast = useToast();
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    scholarship_type: 'partial',
    amount: 50,
    start_date: new Date().toISOString().slice(0, 16),
    max_absences_per_month: 3,
    notes: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schData, studentsData, coursesData] = await Promise.all([
        adminService.getScholarships(0, 100),
        adminService.getStudents(0, 100),
        adminService.getCourses(0, 100, false),
      ]);
      setScholarships(schData.items || []);
      setStudents(studentsData.items || []);
      setCourses(coursesData.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createScholarship({
        ...formData,
        course_id: formData.course_id || null,
        start_date: new Date(formData.start_date).toISOString(),
      });
      toast.success('Scholarship created');
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create scholarship');
    }
  };

  const handleTerminate = async (id) => {
    const reason = window.prompt('Termination reason:');
    if (!reason) return;
    try {
      await adminService.terminateScholarship(id, reason);
      toast.success('Scholarship terminated');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate');
    }
  };

  const getCourseTitle = (id) => courses.find((c) => c.id === id)?.title || 'All courses';

  if (loading) return <p className="text-center py-8">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Scholarship Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>+ Add Scholarship</Button>
      </div>
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select className="w-full border rounded px-3 py-2" value={formData.student_id} onChange={(e) => setFormData((p) => ({ ...p, student_id: e.target.value }))} required>
                <option value="">Select</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.id.slice(-8)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course (optional)</label>
              <select className="w-full border rounded px-3 py-2" value={formData.course_id} onChange={(e) => setFormData((p) => ({ ...p, course_id: e.target.value }))}>
                <option value="">All courses</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded px-3 py-2" value={formData.scholarship_type} onChange={(e) => setFormData((p) => ({ ...p, scholarship_type: e.target.value }))}>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
                <option value="merit">Merit</option>
                <option value="entry_test">Entry Test</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <Input label="Amount (%)" type="number" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) }))} />
            <Input label="Start Date" type="datetime-local" value={formData.start_date} onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))} />
            <Input label="Max absences/month" type="number" value={formData.max_absences_per_month} onChange={(e) => setFormData((p) => ({ ...p, max_absences_per_month: parseInt(e.target.value, 10) }))} />
            <Input label="Notes" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}
      <div className="space-y-3">
        {scholarships.map((s) => (
          <Card key={s.id}>
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold capitalize">{s.scholarship_type} - {s.amount}%</h4>
                <p className="text-sm text-gray-600">Student: {s.student_id.slice(-6)} | Course: {getCourseTitle(s.course_id)}</p>
                <p className="text-sm">Absences: {s.current_month_absences}/{s.max_absences_per_month} | Status: {s.status}</p>
              </div>
              {s.status === 'active' && (
                <Button className="bg-red-500 text-sm" onClick={() => handleTerminate(s.id)}>Terminate</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminScholarshipManagement;
