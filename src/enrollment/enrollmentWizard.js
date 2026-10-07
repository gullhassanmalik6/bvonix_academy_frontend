export const WIZARD_STEPS = [
  { id: 'course', label: 'Choose Course' },
  { id: 'personal', label: 'Personal Information' },
  { id: 'class', label: 'Class Preference' },
  { id: 'payment', label: 'Payment' },
  { id: 'receipt', label: 'Upload Receipt' },
  { id: 'review', label: 'Under Review' },
];

const RECEIPT_STATES = new Set(['pending', 'resubmission_required', 'receipt_uploaded']);

export function enrollmentWorkflowState(enrollment) {
  if (!enrollment) return null;
  if (enrollment.workflow_state) return enrollment.workflow_state;
  if (enrollment.payment_receipt_url) return 'receipt_uploaded';
  return 'pending';
}

export function wizardStepIndex(enrollment) {
  if (!enrollment) return 0;
  const state = enrollmentWorkflowState(enrollment);
  if (state === 'pending' || state === 'resubmission_required') return 4;
  return 5;
}

export function canUploadReceipt(enrollment) {
  if (!enrollment) return false;
  return RECEIPT_STATES.has(enrollmentWorkflowState(enrollment));
}

export function nextExpectedAction(enrollment) {
  const state = enrollmentWorkflowState(enrollment);
  switch (state) {
    case 'pending':
      return 'Upload the payment receipt. Payment stays pending until an administrator verifies it.';
    case 'receipt_uploaded':
      return 'Wait for an administrator to review the receipt.';
    case 'under_review':
      return 'Wait for the review decision.';
    case 'approved':
      return 'Wait for the enrollment to be activated.';
    case 'rejected':
      return 'This payment was rejected. A new receipt can be uploaded only after the academy requests resubmission.';
    case 'resubmission_required':
      return 'Upload a new payment receipt.';
    case 'active':
      return 'Open the course. This enrollment is active.';
    case 'completed':
      return 'This course enrollment is complete.';
    case 'refunded':
      return 'This payment was refunded.';
    case 'cancelled':
      return 'This enrollment is cancelled.';
    default:
      return 'Check this enrollment with the academy.';
  }
}

export function formatApiError(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item === 'string' ? item : item?.msg))
      .filter(Boolean);
    if (messages.length) return messages.join(' ');
  }
  return error?.response?.data?.message || error?.message || fallback;
}

export function validateCourseStep(courseId) {
  if (!courseId) return { course: 'Choose a course to continue.' };
  return {};
}

export function validatePersonalStep(form) {
  const errors = {};
  const phone = (form.phone_number || '').trim();
  const guardian = (form.father_guardian_name || '').trim();
  if (!phone) errors.phone_number = 'Enter your phone number.';
  else if (phone.length > 20) errors.phone_number = 'Phone number must be 20 characters or fewer.';
  if (!guardian) errors.father_guardian_name = 'Enter the father or guardian name.';
  else if (guardian.length > 120) errors.father_guardian_name = 'Name must be 120 characters or fewer.';
  if (!form.date_of_birth) errors.date_of_birth = 'Enter your date of birth.';
  else if (form.date_of_birth.length > 20) errors.date_of_birth = 'Use a valid date.';
  if (!form.gender) errors.gender = 'Select your gender.';
  else if (form.gender.length > 30) errors.gender = 'Gender must be 30 characters or fewer.';
  if (!form.profileImageFile && !form.profile_image_url) {
    errors.profile_image = 'Upload a passport-size photo (JPEG, PNG, or WebP, up to 5MB).';
  }
  const emergencyName = (form.emergency_contact_name || '').trim();
  const emergencyPhone = (form.emergency_contact_phone || '').trim();
  if (emergencyName.length > 120) errors.emergency_contact_name = 'Name must be 120 characters or fewer.';
  if (emergencyPhone.length > 20) errors.emergency_contact_phone = 'Phone number must be 20 characters or fewer.';
  return errors;
}

export function validateClassStep(form) {
  const errors = {};
  if (form.class_type !== 'online' && form.class_type !== 'physical') {
    errors.class_type = 'Choose online or physical.';
  }
  const address = (form.address || '').trim();
  if (form.class_type === 'physical' && !address) {
    errors.address = 'Enter your address for a physical class.';
  } else if (address.length > 500) {
    errors.address = 'Address must be 500 characters or fewer.';
  }
  return errors;
}

export function validateReceiptFile(file) {
  if (!file) return 'Choose a receipt image or PDF.';
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) return 'Use a JPEG, PNG, or PDF receipt.';
  if (file.size > 10 * 1024 * 1024) return 'Receipt must be 10MB or smaller.';
  return '';
}

export function buildEnrollmentPayload(form, profileImageUrl) {
  return {
    class_type: form.class_type,
    phone_number: form.phone_number.trim(),
    address: form.class_type === 'physical' ? form.address.trim() : (form.address.trim() || null),
    father_guardian_name: form.father_guardian_name.trim(),
    date_of_birth: form.date_of_birth,
    gender: form.gender,
    emergency_contact_name: form.emergency_contact_name.trim() || null,
    emergency_contact_phone: form.emergency_contact_phone.trim() || null,
    profile_image_url: profileImageUrl,
    payment_status: 'pending',
  };
}
