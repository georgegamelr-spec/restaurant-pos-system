import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardProps) {
  return (
    <div className={`p-6 pb-0 ${className}`}>{children}</div>
  );
}

export function CardTitle({ className = '', children }: CardProps) {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h3>
  );
}

export function CardDescription({ className = '', children }: CardProps) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
  );
}

export function CardContent({ className = '', children }: CardProps) {
  return (
    <div className={`p-6 ${className}`}>{children}</div>
  );
}

export function CardFooter({ className = '', children }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
  );
}
