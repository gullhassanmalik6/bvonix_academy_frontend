import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import EmptyState from '../common/EmptyState';
import { DataState, useCollectionView } from '../common/DataState';

const AdminPaymentManagement = ({ focusId = null }) => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const listView = useCollectionView();
  const { start, succeed, fail } = listView;
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    amount: 0,
    currency: 'PKR',
    payment_method: 'bank_transfer',
    scholarship_discount: 0,
    notes: '',
  });

  const loadData = useCallback(async () => {
    start();
    try {
      setLoading(true);
      const [payData, studentsData, coursesData] = await Promise.all([
        adminService.getPayments(0, 100),
        adminService.getStudents(0, 100),
        adminService.getCourses(0, 100, false),
      ]);
      const items = payData.items || [];
      setPayments(items);
      setStudents(studentsData.items || []);
      setCourses(coursesData.items || []);
      succeed(items);
    } catch (err) {
      setPayments([]);
      await fail(err, 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [start, succeed, fail]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!focusId || loading) return;
    document.getElementById(`payment-${focusId}`)?.scrollIntoView({ block: 'center' });
  }, [focusId, loading, payments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createPayment({ ...formData, course_id: formData.course_id || null });
      toast.success('Payment created');
      setShowForm(false);
      loadData();
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to create payment');
      toast.error(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updatePayment(id, { payment_status: status, payment_date: new Date().toISOString() });
      toast.success('Payment updated');
      loadData();
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to update');
      toast.error(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  if (loading) return <p className="text-center py-8">Loading payments...</p>;
  if (listView.status === 'error' || listView.status === 'denied') {
    return <DataState status={listView.status} message={listView.message} onRetry={loadData} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>+ Add Payment</Button>
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
                <option value="">None</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <Input label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) }))} required />
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select className="w-full border rounded px-3 py-2" value={formData.payment_method} onChange={(e) => setFormData((p) => ({ ...p, payment_method: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
            <Input label="Notes" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}
      {payments.length === 0 ? (
        <EmptyState
          icon="default"
          title="No payment records"
          description="Add a payment when a student pays by cash, transfer, card, or online."
        />
      ) : (
      <div className="space-y-3">
        {payments.map((p) => (
          <Card key={p.id} id={`payment-${p.id}`} className={focusId === p.id ? 'ring-2 ring-blue-600' : ''}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{p.amount} {p.currency}</p>
                <p className="text-sm text-gray-600">Student: {p.student_id?.slice(-8)} | Status: {p.payment_status}</p>
              </div>
              {p.payment_status === 'pending' && (
                <Button className="text-sm" onClick={() => handleUpdateStatus(p.id, 'completed')}>Mark Paid</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
};

export default AdminPaymentManagement;
