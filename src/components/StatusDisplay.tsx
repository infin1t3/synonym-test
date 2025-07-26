import React from 'react';
import { ExclamationTriangleIcon, GlobeIcon } from '@radix-ui/react-icons';

interface StatusDisplayProps {
  type: 'error' | 'offline' | 'empty';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  type,
  title,
  message,
  action,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
      case 'offline':
        return <GlobeIcon className="h-12 w-12 text-orange-500" />;
      default:
        return <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'offline':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          button: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className={`max-w-md w-full text-center p-8 rounded-lg border ${colors.bg} ${colors.border}`}>
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        {action && (
          <button
            onClick={action.onClick}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${colors.button} focus:outline-none transition-colors duration-200 cursor-pointer`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

interface OfflineBannerProps {
  isVisible: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 p-4 mb-6">
      <div className="flex items-center">
        <GlobeIcon className="h-5 w-5 text-orange-500 mr-3" />
        <div>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>You are offline.</strong> Showing cached data from your last visit.
          </p>
        </div>
      </div>
    </div>
  );
}; 