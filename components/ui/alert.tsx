import React from 'react';

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
  children: React.ReactNode;
}

export function Alert({ variant = 'default', className = '', children }: AlertProps) {
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={`text-sm ${className}`}>{children}</p>
  );
}
