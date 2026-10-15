import { useEffect, useMemo, useState } from 'react';
import { fetchPrivateObjectUrl, privateUploadKind } from '../../services/api';
import { lmsService } from '../../services/lmsService';
import { uploadService } from '../../services/uploadService';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import {
  WIZARD_STEPS,
  buildEnrollmentPayload,
  canUploadReceipt,
  enrollmentWorkflowState,
  formatApiError,
  nextExpectedAction,
  validateClassStep,
  validateCourseStep,
  validatePersonalStep,
  validateReceiptFile,
  wizardStepIndex,
} from '../../enrollment/enrollmentWizard';

const emptyForm = {
  class_type: 'online',
  phone_number: '',
  address: '',
  father_guardian_name: '',
  date_of_birth: '',
  gender: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  profile_image_url: null,
};

function formFromEnrollment(enrollment) {
  if (!enrollment) return emptyForm;
  return {
    class_type: enrollment.class_type || 'online',
    phone_number: enrollment.phone_number || '',
    address: enrollment.address || '',
    father_guardian_name: enrollment.father_guardian_name || '',
    date_of_birth: enrollment.date_of_birth || '',
    gender: enrollment.gender || '',
    emergency_contact_name: enrollment.emergency_contact_name || '',
    emergency_contact_phone: enrollment.emergency_contact_phone || '',
    profile_image_url: enrollment.profile_image_url || null,
  };
}

const EnrollmentWizard = ({
  courses = [],
  enrollments = [],
  initialCourseId = null,
  initialEnrollment = null,
  onClose,
  onUpdated,
}) => {
  const startingEnrollment = initialEnrollment
    || enrollments.find((item) => item.course_id === initialCourseId)
    || null;
  const [step, setStep] = useState(wizardStepIndex(startingEnrollment));
  const [courseId, setCourseId] = useState(startingEnrollment?.course_id || initialCourseId || '');
  const [form, setForm] = useState(formFromEnrollment(startingEnrollment));
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(startingEnrollment?.profile_image_url || null);

  useEffect(() => {
    const source = startingEnrollment?.profile_image_url;
    if (!source || !privateUploadKind(source)) return undefined;
    let cancelled = false;
    let objectUrl = null;
    fetchPrivateObjectUrl(source)
      .then((url) => {
        if (cancelled) {
          if (url) window.URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        if (url) setProfilePreview(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [startingEnrollment?.profile_image_url]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [enrollment, setEnrollment] = useState(startingEnrollment);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const course = useMemo(
    () => courses.find((item) => item.id === courseId) || null,
    [courses, courseId],
  );
  const openCourses = courses.filter(
    (item) => !enrollments.some((enrollmentItem) => enrollmentItem.course_id === item.id) || item.id === courseId,
  );
  const locked = Boolean(enrollment);
  const workflow = enrollmentWorkflowState(enrollment);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setApiError('');
  };

  const validateCurrentStep = () => {
    if (step === 0) return validateCourseStep(courseId);
    if (step === 1) return validatePersonalStep({ ...form, profileImageFile });
    if (step === 2) return validateClassStep(form);
    if (step === 4 && canUploadReceipt(enrollment)) {
      const message = validateReceiptFile(receiptFile);
      return message ? { receipt: message } : {};
    }
    return {};
  };

  const goNext = async () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setApiError('');

    if (step === 3 && !enrollment) {
      await createEnrollment();
      return;
    }
    if (step === 4 && enrollment && canUploadReceipt(enrollment)) {
      await submitReceipt();
      return;
    }
    setStep((current) => Math.min(current + 1, WIZARD_STEPS.length - 1));
  };

  const createEnrollment = async () => {
    setSubmitting(true);
    try {
      let profileImageUrl = form.profile_image_url;
      if (profileImageFile) {
        const uploaded = await uploadService.uploadProfileImage(profileImageFile);
        profileImageUrl = uploaded.url || uploaded.file_url || uploaded.profile_image_url;
        if (!profileImageUrl) {
          setApiError('The profile photo uploaded, but no file address was returned.');
          return;
        }
      }
      const created = await lmsService.enrollInCourse(
        courseId,
        buildEnrollmentPayload(form, profileImageUrl),
      );
      setEnrollment(created);
      setStep(wizardStepIndex(created));
      if (onUpdated) await onUpdated(created);
    } catch (error) {
      setApiError(formatApiError(error, 'Enrollment could not be saved.'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitReceipt = async () => {
    setSubmitting(true);
    try {
      const uploaded = await uploadService.uploadPaymentReceipt(receiptFile);
      if (!uploaded?.url) {
        setApiError('The receipt uploaded, but no file address was returned.');
        return;
      }
      const updated = await lmsService.uploadPaymentReceipt(enrollment.id, uploaded.url);
      setEnrollment(updated);
      setReceiptFile(null);
      setStep(5);
      if (onUpdated) await onUpdated(updated);
    } catch (error) {
      setApiError(formatApiError(error, 'The receipt could not be saved.'));
    } finally {
      setSubmitting(false);
    }
  };

  const onPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors((current) => ({ ...current, profile_image: 'Use a JPEG, PNG, or WebP photo.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, profile_image: 'Photo must be 5MB or smaller.' }));
      return;
    }
    setProfileImageFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, profile_image: undefined }));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Enroll in a course</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step].label}
            </p>
          </div>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 inline-flex items-center justify-center text-gray-500 hover:text-gray-800 text-2xl leading-none shrink-0" aria-label="Close enrollment">
            ×
          </button>
        </div>

        <ol className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {WIZARD_STEPS.map((item, index) => {
            const complete = index < step;
            const current = index === step;
            return (
              <li key={item.id} className="flex-shrink-0">
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => {
                    if (index <= step) setStep(index);
                  }}
                  className={`min-h-11 px-3 rounded-full text-xs sm:text-sm border ${
                    current
                      ? 'bg-primary-500 text-white border-primary-500'
                      : complete
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {index + 1}. {item.label}
                </button>
              </li>
            );
          })}
        </ol>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {apiError}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-3">
            {openCourses.length === 0 && (
              <p className="text-sm text-gray-600">No published courses are available to enroll in.</p>
            )}
            {openCourses.map((item) => (
              <label key={item.id} className={`block border rounded-lg p-3 cursor-pointer ${courseId === item.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="enrollment-course"
                  className="mr-2"
                  checked={courseId === item.id}
                  onChange={() => {
                    setCourseId(item.id);
                    setErrors({});
                  }}
                  disabled={locked}
                />
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className="block text-sm text-gray-600 mt-1">
                  {item.price != null ? `Rs. ${Number(item.price).toLocaleString()}` : 'Fee is listed on the course'}
                </span>
              </label>
            ))}
            {errors.course && <p className="text-sm text-red-600">{errors.course}</p>}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="enrollment-photo" className="block text-sm font-medium text-gray-700 mb-2">
                Passport photo <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                {profilePreview && (
                  <img src={profilePreview} alt="" className="w-20 h-20 object-cover rounded border border-gray-300" />
                )}
                <input id="enrollment-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} disabled={locked} className="block w-full max-w-full text-base" />
              </div>
              {errors.profile_image && <p className="text-sm text-red-600 mt-1">{errors.profile_image}</p>}
            </div>
            <Input label="Phone number" name="enrollment-phone" value={form.phone_number} onChange={(event) => setField('phone_number', event.target.value)} error={errors.phone_number} required disabled={locked} />
            <Input label="Father / guardian name" name="enrollment-guardian" value={form.father_guardian_name} onChange={(event) => setField('father_guardian_name', event.target.value)} error={errors.father_guardian_name} required disabled={locked} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="enrollment-dob" className="block text-sm font-medium text-gray-700 mb-2">Date of birth <span className="text-red-500">*</span></label>
                <input id="enrollment-dob" type="date" value={form.date_of_birth} onChange={(event) => setField('date_of_birth', event.target.value)} disabled={locked} className="w-full min-h-11 px-3 text-base border border-gray-300 rounded-md" />
                {errors.date_of_birth && <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>}
              </div>
              <div>
                <label htmlFor="enrollment-gender" className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <select id="enrollment-gender" value={form.gender} onChange={(event) => setField('gender', event.target.value)} disabled={locked} className="w-full min-h-11 px-3 text-base border border-gray-300 rounded-md">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
              </div>
            </div>
            <Input label="Emergency contact name" name="enrollment-emergency-name" value={form.emergency_contact_name} onChange={(event) => setField('emergency_contact_name', event.target.value)} error={errors.emergency_contact_name} disabled={locked} />
            <Input label="Emergency contact phone" name="enrollment-emergency-phone" value={form.emergency_contact_phone} onChange={(event) => setField('emergency_contact_phone', event.target.value)} error={errors.emergency_contact_phone} disabled={locked} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Class preference <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['online', 'physical'].map((value) => (
                <label key={value} className={`border rounded-lg p-3 capitalize ${form.class_type === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <input type="radio" name="class-type" className="mr-2" checked={form.class_type === value} onChange={() => setField('class_type', value)} disabled={locked} />
                  {value}
                </label>
              ))}
            </div>
            {errors.class_type && <p className="text-sm text-red-600">{errors.class_type}</p>}
            {form.class_type === 'physical' && (
              <div>
                <label htmlFor="enrollment-address" className="block text-sm font-medium text-gray-700 mb-2">Address <span className="text-red-500">*</span></label>
                <textarea id="enrollment-address" rows={3} value={form.address} onChange={(event) => setField('address', event.target.value)} disabled={locked} className="w-full px-3 py-2 text-base border border-gray-300 rounded-md" />
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-medium text-gray-900">{course?.title || 'Selected course'}</p>
            <p>Course fee: {course?.price != null ? `Rs. ${Number(course.price).toLocaleString()}` : 'Shown on the course page'}</p>
            <p>Class: <span className="capitalize">{form.class_type}</span></p>
            <p>Continuing creates the enrollment with payment status <strong>pending</strong>. Paying this fee does not happen on this page, and the payment is not marked paid here.</p>
            {enrollment && (
              <p>This enrollment already exists. Payment status: <strong>{enrollment.payment_status}</strong>.</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {workflow === 'resubmission_required' && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
                The academy asked for a new receipt. Upload it to send this enrollment back for review.
              </p>
            )}
            {canUploadReceipt(enrollment) ? (
              <>
                <label htmlFor="enrollment-receipt" className="block text-sm font-medium text-gray-700">Payment receipt</label>
                <input id="enrollment-receipt" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => { setReceiptFile(event.target.files?.[0] || null); setErrors({}); }} className="block w-full max-w-full text-base" />
                <p className="text-xs text-gray-500">JPEG, PNG, or PDF, up to 10MB.</p>
                {errors.receipt && <p className="text-sm text-red-600">{errors.receipt}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-700">{nextExpectedAction(enrollment)}</p>
            )}
          </div>
        )}

        {step === 5 && enrollment && (
          <div className="space-y-3 text-sm text-gray-700">
            <p><span className="text-gray-500">Enrollment ID</span><br /><span className="font-mono text-gray-900 break-all">{enrollment.id}</span></p>
            <p><span className="text-gray-500">Payment verification</span><br /><span className="font-medium text-gray-900 capitalize">{enrollment.payment_status}</span></p>
            <p><span className="text-gray-500">Enrollment status</span><br /><span className="font-medium text-gray-900 capitalize">{enrollment.status}</span></p>
            <p><span className="text-gray-500">Workflow</span><br /><span className="font-medium text-gray-900">{workflow?.replaceAll('_', ' ')}</span></p>
            <p className="p-3 bg-gray-50 border border-gray-200 rounded">{nextExpectedAction(enrollment)}</p>
            {workflow === 'resubmission_required' && (
              <Button type="button" onClick={() => setStep(4)}>Upload a new receipt</Button>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          {step > 0 && step < 5 && (
            <Button type="button" onClick={() => setStep((current) => current - 1)} disabled={submitting} className="bg-gray-500 hover:bg-gray-600">
              Back
            </Button>
          )}
          {step < 5 && !(step === 4 && !canUploadReceipt(enrollment)) && (
            <Button type="button" onClick={goNext} disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : step === 3 && !enrollment ? 'Create enrollment' : step === 4 ? 'Upload receipt' : 'Continue'}
            </Button>
          )}
          {(step === 5 || (step === 4 && !canUploadReceipt(enrollment))) && (
            <Button type="button" onClick={onClose} className="flex-1">Close</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EnrollmentWizard;
