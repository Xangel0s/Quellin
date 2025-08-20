import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        className="block w-full rounded-md border-slate-400 placeholder-slate-400 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm transition duration-150 ease-in-out p-2"
        {...props}
      />
    </div>
  );
};

export default Textarea;