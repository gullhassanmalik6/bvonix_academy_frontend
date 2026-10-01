import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { downloadCardPreviewPdf, fetchPreviewCardData } from '../../utils/cardPreviewPdf';
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage, getFileUrl } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

const AdminEnrollmentManagement = () => {
  const toast = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    verified: '',
  });
  const [cardFormEnrollmentId, setCardFormEnrollmentId] = useState(null);
  const [cardFormData, setCardFormData] = useState(null);
  const [cardFormLoading, setCardFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentsData, coursesData] = await Promise.all([
        adminService.getEnrollments(0, 100, filters.status || null, filters.payment_status || null, filters.verified || null),
        courseService.getCourses({ skip: 0, limit: 100 }),
      ]);
      setEnrollments(enrollmentsData.items || []);
      setCourses(coursesData.items || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to verify this enrollment?')) {
      return;
    }
    try {
      await adminService.verifyEnrollment(enrollmentId);
      toast.success('Enrollment verified successfully!', { duration: 3000 });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify enrollment', { duration: 4000 });
    }
  };

  const handleGenerateCard = async (enrollmentId) => {
    if (!window.confirm('Generate enrollment card for this verified enrollment?')) {
      return;
    }
    try {
      await adminService.generateEnrollmentCard(enrollmentId);
      toast.success('Enrollment card generated successfully!', { duration: 3000 });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate enrollment card', { duration: 4000 });
    }
  };

  const handleOpenCardForm = async (enrollmentId) => {
    try {
      setCardFormLoading(true);
      setCardFormEnrollmentId(enrollmentId);
      const data = await adminService.getEnrollmentCardForm(enrollmentId);
      setCardFormData({
        student_full_name: data.student_full_name || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load card form');
      setCardFormEnrollmentId(null);
    } finally {
      setCardFormLoading(false);
    }
  };

  const handleSaveCardForm = async () => {
    if (!cardFormEnrollmentId || !cardFormData) return;
    try {
      await adminService.updateEnrollmentCardForm(cardFormEnrollmentId, cardFormData);
      toast.success('Card details saved');
      setCardFormEnrollmentId(null);
      setCardFormData(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save card form');
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to cancel this enrollment? The student will lose LMS access for this course.')) {
      return;
    }
    try {
      await adminService.cancelEnrollment(enrollmentId);
      toast.success('Enrollment cancelled successfully!', { duration: 3000 });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel enrollment', { duration: 4000 });
    }
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  if (loading) {
    return <div className="text-center py-8">Loading enrollments...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Enrollments List */}
      <div className="space-y-4">
        {enrollments.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No enrollments found.</p>
          </Card>
        ) : (
          enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getCourseTitle(enrollment.course_id)}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      enrollment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enrollment.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      enrollment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      enrollment.payment_status === 'refunded' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      Payment: {enrollment.payment_status}
                    </span>
                    {enrollment.verified_by_admin && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Enrollment Date:</span>
                      <p>{new Date(enrollment.enrollment_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Class Type:</span>
                      <p className="capitalize">{enrollment.class_type}</p>
                    </div>
                    {enrollment.phone_number && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p>{enrollment.phone_number}</p>
                      </div>
                    )}
                    {enrollment.enrollment_card_number && (
                      <div>
                        <span className="font-medium">Card Number:</span>
                        <p className="font-mono text-xs">{enrollment.enrollment_card_number}</p>
                      </div>
                    )}
                  </div>

                  {enrollment.address && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Address:</span> {enrollment.address}
                    </div>
                  )}

                  {enrollment.emergency_contact_name && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Emergency Contact:</span> {enrollment.emergency_contact_name}
                      {enrollment.emergency_contact_phone && ` (${enrollment.emergency_contact_phone})`}
                    </div>
                  )}

                  {/* Payment Receipt Section */}
                  {enrollment.payment_receipt_url ? (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        ✓ Payment Receipt Uploaded
                      </p>
                      <Button
                        onClick={() => window.open(getFileUrl(enrollment.payment_receipt_url), '_blank')}
                        className="bg-green-500 hover:bg-green-600 text-sm"
                      >
                        View Payment Receipt
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Payment receipt not uploaded yet
                      </p>
                    </div>
                  )}

                  {enrollment.verified_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Verified on: {new Date(enrollment.verified_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {enrollment.status !== 'cancelled' && (
                    <Button
                      onClick={() => handleCancelEnrollment(enrollment.id)}
                      className="bg-red-500 hover:bg-red-600 text-sm whitespace-nowrap"
                    >
                      ✕ Cancel Enrollment
                    </Button>
                  )}
                  {enrollment.payment_receipt_url && !enrollment.verified_by_admin && (
                    <Button
                      onClick={() => handleVerify(enrollment.id)}
                      className="bg-green-500 hover:bg-green-600 text-sm whitespace-nowrap"
                    >
                      ✓ Verify Payment
                    </Button>
                  )}
                  {!enrollment.payment_receipt_url && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded text-center">
                      Waiting for Receipt
                    </span>
                  )}
                  {enrollment.verified_by_admin && (
                    <>
                      <Button
                        onClick={() => handleOpenCardForm(enrollment.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-sm whitespace-nowrap"
                      >
                        Edit Card Info
                      </Button>
                      {!enrollment.enrollment_card_url ? (
                        <Button
                          onClick={() => handleGenerateCard(enrollment.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-sm whitespace-nowrap"
                        >
                          📄 Generate Card
                        </Button>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded text-center">
                            ✓ Verified
                          </span>
                          <Link
                            to={`/card-preview/${enrollment.id}`}
                            className="inline-block text-center bg-violet-600 hover:bg-violet-700 text-white text-sm whitespace-nowrap px-3 py-2 rounded-lg"
                          >
                            Preview Card
                          </Link>
                          <Button
                            onClick={async () => {
                              try {
                                const cardData = await fetchPreviewCardData(enrollment.id);
                                await downloadCardPreviewPdf(
                                  cardData,
                                  `enrollment_card_${cardData.studentId || enrollment.enrollment_card_number || enrollment.id}.pdf`
                                );
                                toast.success('Card PDF downloaded');
                              } catch (err) {
                                toast.error(err?.message || (await getApiErrorMessage(err, 'Download failed')));
                              }
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-sm whitespace-nowrap"
                          >
                            Download PDF
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {cardFormEnrollmentId && cardFormData && (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Edit Enrollment Card Info</h3>
          {cardFormLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              <Input label="Student Name" value={cardFormData.student_full_name} onChange={(e) => setCardFormData((p) => ({ ...p, student_full_name: e.target.value }))} />
              <Input label="Phone" value={cardFormData.phone_number || ''} onChange={(e) => setCardFormData((p) => ({ ...p, phone_number: e.target.value }))} />
              <Input label="Father / Guardian Name" value={cardFormData.father_guardian_name || ''} onChange={(e) => setCardFormData((p) => ({ ...p, father_guardian_name: e.target.value }))} />
              <Input label="Date of Birth" type="date" value={cardFormData.date_of_birth || ''} onChange={(e) => setCardFormData((p) => ({ ...p, date_of_birth: e.target.value }))} />
              <Input label="Gender" value={cardFormData.gender || ''} onChange={(e) => setCardFormData((p) => ({ ...p, gender: e.target.value }))} />
              <Input label="Address" value={cardFormData.address || ''} onChange={(e) => setCardFormData((p) => ({ ...p, address: e.target.value }))} />
              <Input label="Emergency Contact" value={cardFormData.emergency_contact_name || ''} onChange={(e) => setCardFormData((p) => ({ ...p, emergency_contact_name: e.target.value }))} />
              <Input label="Emergency Phone" value={cardFormData.emergency_contact_phone || ''} onChange={(e) => setCardFormData((p) => ({ ...p, emergency_contact_phone: e.target.value }))} />
              <div className="flex gap-2">
                <Button onClick={handleSaveCardForm}>Save</Button>
                <Button variant="secondary" onClick={() => { setCardFormEnrollmentId(null); setCardFormData(null); }}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminEnrollmentManagement;
