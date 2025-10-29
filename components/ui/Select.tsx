import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, name, error, children, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <select
          id={name}
          name={name}
          className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
