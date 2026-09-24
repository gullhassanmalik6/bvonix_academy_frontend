/**
 * Email validation
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Password validation (min 8 characters)
 */
export const validatePassword = (password) => {
  return password.length >= 8;
};

/**
 * Form validation helper
 */
export const validateForm = (fields) => {
  const errors = {};
  
  Object.keys(fields).forEach((key) => {
    const value = fields[key];
    if (!value || value.trim() === '') {
      errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
