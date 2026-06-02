'use client';

import React from 'react';
import { ToastNotification } from '@/types';

interface ToastProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 min-w-[300px] animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 text-lg font-bold hover:opacity-75"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
