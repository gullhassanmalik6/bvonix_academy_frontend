import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  success,
  required = false,
  floatingLabel = false,
  validateOnChange = false,
  validationRules = {},
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const hasValue = value && value.toString().trim().length > 0;
  const showFloatingLabel = floatingLabel && (isFocused || hasValue);
  const displayError = error || (validateOnChange && hasInteracted && validationError);

  useEffect(() => {
    if (validateOnChange && hasInteracted && value !== undefined) {
      validateInput(value);
    }
  }, [value, validateOnChange, hasInteracted]);

  const validateInput = (inputValue) => {
    if (!validationRules || Object.keys(validationRules).length === 0) {
      setValidationError(null);
      return;
    }

    const rules = validationRules;

    // Required validation
    if (rules.required && (!inputValue || inputValue.toString().trim().length === 0)) {
      setValidationError(rules.requiredMessage || 'This field is required');
      return;
    }

    // Min length validation
    if (rules.minLength && inputValue && inputValue.toString().length < rules.minLength) {
      setValidationError(rules.minLengthMessage || `Minimum ${rules.minLength} characters required`);
      return;
    }

    // Max length validation
    if (rules.maxLength && inputValue && inputValue.toString().length > rules.maxLength) {
      setValidationError(rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`);
      return;
    }

    // Pattern validation (regex)
    if (rules.pattern && inputValue && !rules.pattern.test(inputValue)) {
      setValidationError(rules.patternMessage || 'Invalid format');
      return;
    }

    // Email validation
    if (rules.email && inputValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        setValidationError(rules.emailMessage || 'Please enter a valid email address');
        return;
      }
    }

    // Custom validation function
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(inputValue);
      if (customError) {
        setValidationError(customError);
        return;
      }
    }

    setValidationError(null);
  };

  const handleChange = (e) => {
    setHasInteracted(true);
    if (onChange) {
      onChange(e);
    }
    if (validateOnChange) {
      validateInput(e.target.value);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasInteracted(true);
    if (validateOnChange) {
      validateInput(e.target.value);
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const inputId = name || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = displayError ? `${inputId}-error` : undefined;
  const successId = success ? `${inputId}-success` : undefined;

  return (
    <div className={`mb-4 ${className}`}>
      {floatingLabel ? (
        <div className="relative">
          <input
            type={type}
            id={inputId}
            name={name}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={showFloatingLabel ? placeholder : label}
            required={required}
            aria-label={ariaLabel || label}
            aria-invalid={displayError ? 'true' : 'false'}
            aria-describedby={[errorId, successId, ariaDescribedBy].filter(Boolean).join(' ') || undefined}
            className={`
              input w-full px-4 pt-6 pb-2 border rounded-lg transition-all duration-200
              ${displayError 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : success 
                  ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }
              ${showFloatingLabel ? 'pt-6 pb-2' : 'py-2'}
            `}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${showFloatingLabel
                ? 'top-2 text-xs text-gray-600 font-medium'
                : 'top-1/2 -translate-y-1/2 text-gray-500'
              }
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
          {hasValue && !displayError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {success ? (
                <FiCheckCircle className="text-green-500" aria-hidden="true" />
              ) : (
                <FiCheckCircle className="text-gray-400" aria-hidden="true" />
              )}
            </div>
          )}
          {displayError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <FiXCircle className="text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
      ) : (
        <>
          {label && (
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>
          )}
          <div className="relative">
            <input
              type={type}
              id={inputId}
              name={name}
              value={value || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder={placeholder}
              required={required}
              aria-label={ariaLabel || label}
              aria-invalid={displayError ? 'true' : 'false'}
              aria-describedby={[errorId, successId, ariaDescribedBy].filter(Boolean).join(' ') || undefined}
              className={`
                input w-full px-4 py-2 border rounded-lg transition-all duration-200
                ${displayError 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500 pr-10' 
                  : success 
                    ? 'border-green-500 focus:ring-green-500 focus:border-green-500 pr-10' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }
              `}
              {...props}
            />
            {hasValue && !displayError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {success ? (
                  <FiCheckCircle className="text-green-500" aria-hidden="true" />
                ) : null}
              </div>
            )}
            {displayError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <FiXCircle className="text-red-500" aria-hidden="true" />
              </div>
            )}
          </div>
        </>
      )}
      {displayError && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <FiAlertCircle className="w-4 h-4" aria-hidden="true" />
          {displayError}
        </p>
      )}
      {success && !displayError && (
        <p 
          id={successId}
          className="mt-1 text-sm text-green-600 flex items-center gap-1"
          role="status"
          aria-live="polite"
        >
          <FiCheckCircle className="w-4 h-4" aria-hidden="true" />
          {success}
        </p>
      )}
    </div>
  );
};

export default Input;
