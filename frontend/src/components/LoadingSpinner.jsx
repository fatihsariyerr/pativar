import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-peach-200 border-t-peach-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🐾</span>
        </div>
      </div>
    </div>
  );
}
