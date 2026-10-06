export function canAccessAdminPanel(role) {
  return role === 'academic_manager' || role === 'admin' || role === 'super_admin';
}

export function isPaymentAdmin(role) {
  return role === 'admin' || role === 'super_admin';
}

export function adminRoleLabel(role) {
  if (role === 'super_admin') return 'Super admin';
  if (role === 'academic_manager') return 'Academic manager';
  if (role === 'admin') return 'Admin';
  return null;
}
