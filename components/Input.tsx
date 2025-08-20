import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, icon, className, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>}
      <div className="relative">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>}
        <input
          id={id}
          className={`block w-full rounded-md border-slate-400 placeholder-slate-400 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm transition duration-150 ease-in-out ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;