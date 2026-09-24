import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiArrowRight } from 'react-icons/fi';

const ICONS = {
  zap: FiZap,
  arrow: FiArrowRight,
};

const SIZE_CLASSES = {
  sm: {
    height: 'h-10',
    label: 'px-5 text-sm',
    iconWidth: 'w-10',
    iconSize: 'w-4 h-4',
  },
  md: {
    height: 'h-12',
    label: 'px-7 text-base',
    iconWidth: 'w-12',
    iconSize: 'w-5 h-5',
  },
  lg: {
    height: 'h-14',
    label: 'px-8 text-lg',
    iconWidth: 'w-14',
    iconSize: 'w-6 h-6',
  },
};

/**
 * Split-pill CTA: white label + full-height red icon cap.
 */
const EnrollButton = ({
  text = 'Enroll Now',
  to,
  href,
  onClick,
  type = 'button',
  size = 'md',
  icon = 'zap',
  className = '',
  external = false,
  disabled = false,
  ariaLabel,
}) => {
  const sizes = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const IconComponent = ICONS[icon] || FiZap;

  const baseClass = [
    'group inline-flex items-stretch rounded-full overflow-hidden',
    sizes.height,
    'border border-gray-200/90 bg-white',
    'shadow-[0_2px_14px_rgba(15,23,42,0.08)]',
    'transition-all duration-200 ease-out',
    'hover:shadow-[0_6px_24px_rgba(229,57,53,0.22)] hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-[0_2px_10px_rgba(229,57,53,0.18)]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    className,
  ].join(' ');

  const content = (
    <>
      <span
        className={`flex items-center h-full font-semibold text-[#1F1F1F] tracking-tight bg-white ${sizes.label}`}
      >
        {text}
      </span>
      {icon !== 'none' && (
        <span
          className={`flex items-center justify-center h-full shrink-0 bg-primary-500 text-white transition-colors duration-200 group-hover:bg-primary-600 ${sizes.iconWidth}`}
          aria-hidden="true"
        >
          <IconComponent className={`${sizes.iconSize} transition-transform duration-200 group-hover:scale-110`} />
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass} aria-label={ariaLabel || text}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={baseClass}
        aria-label={ariaLabel || text}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClass}
      aria-label={ariaLabel || text}
    >
      {content}
    </button>
  );
};

export default EnrollButton;
