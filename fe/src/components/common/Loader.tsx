'use client';

import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg">
        <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    ))}
  </div>
);
