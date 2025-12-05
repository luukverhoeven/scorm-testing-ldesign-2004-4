import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const variants = {
    primary: "bg-scorm-600 hover:bg-scorm-500 text-white focus:ring-scorm-500 shadow-sm",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400",
    danger: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-sm",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${width} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};