import React from 'react';

export default function CardFieldRow({
  icon: Icon,
  label,
  value,
  valueClassName = '',
  showDivider = true,
  compact = false,
}) {
  return (
    <div
      className={`${showDivider ? 'border-b border-slate-100' : ''} ${
        compact ? 'py-[1.5px]' : 'py-[2.5px]'
      }`}
    >
      <div className="flex items-start gap-[4px]">
        <div className="flex-shrink-0 w-[10px] h-[10px] rounded-full bg-violet-600 flex items-center justify-center mt-[1px]">
          {Icon && <Icon className="w-[5px] h-[5px] text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[5px] font-medium uppercase tracking-wide text-slate-400 leading-none mb-[1px]">
            {label}
          </p>
          <p
            className={`text-[6px] font-bold text-slate-900 leading-tight break-words ${valueClassName}`}
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
