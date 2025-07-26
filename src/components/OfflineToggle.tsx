'use client';

import React from 'react';
import { useUserStore } from '@/store/userStore';

export const OfflineToggle: React.FC = () => {
  const { isManualOffline, setManualOffline } = useUserStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Offline:
      </span>
      <button
        onClick={() => setManualOffline(!isManualOffline)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
          isManualOffline ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        aria-label={isManualOffline ? 'Disable offline mode' : 'Enable offline mode'}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
            isManualOffline ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}; 