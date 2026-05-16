import React from 'react'

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div 
      className={`bg-white border border-gray-100 rounded-2xl p-7 min-h-sm mx-auto w-full ${className}`}
      style={{ boxShadow: 'var(--shadows-1)' }}
    >
        {children}
    </div>
  )
}
