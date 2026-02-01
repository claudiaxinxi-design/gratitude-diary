
import React from 'react';

export const MinimalButton: React.FC<{
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'outline' | 'ghost' | 'solid';
}> = ({ onClick, className = '', children, disabled, variant = 'outline' }) => {
  const base = "px-4 py-1.5 text-sm transition-all duration-200 flex items-center justify-center font-medium rounded-md active:scale-[0.98]";
  const variants = {
    outline: "border border-[#E9E9E7] hover:bg-[#F1F1EF] text-[#37352F]",
    ghost: "hover:bg-[#F1F1EF] text-[#787774]",
    solid: "bg-[#37352F] text-white hover:bg-opacity-90"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export const MinimalCard: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <div className={`notion-border bg-white notion-shadow rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

export const ProgressDots: React.FC<{
  currentStep: number;
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => (
  <div className="flex space-x-2">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i <= currentStep ? 'bg-[#37352F]' : 'bg-[#E9E9E7]'
        }`}
      />
    ))}
  </div>
);
