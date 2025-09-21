import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancedLoadingProps {
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text = 'Loading...',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      default: return 'text-base';
    }
  };

  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className={`${getSizeClasses()} animate-spin rounded-full border-3 border-gray-300 border-t-primary`}></div>
        {text && <p className={`text-gray-600 ${getTextSize()}`}>{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className={`${getSizeClasses()} bg-gradient-to-r from-primary to-accent rounded-full animate-pulse`}></div>
        {text && <p className={`text-gray-600 ${getTextSize()} animate-pulse`}>{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && <p className={`text-gray-600 ${getTextSize()}`}>{text}</p>}
      </div>
    );
  }

  // Skeleton variant for content loading
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Enhanced Loading States for different contexts
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary/5">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full animate-ping"></div>
        <div className="relative w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{text}</h2>
      <p className="text-gray-600">Please wait while we load your content</p>
    </div>
  </div>
);

export const InlineLoading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center space-x-2 py-8">
    <div className="w-5 h-5 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce"></div>
    <div className="w-5 h-5 bg-gradient-to-r from-accent to-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-5 h-5 bg-gradient-to-r from-secondary to-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <span className="ml-3 text-gray-600">{text}</span>
  </div>
);

export const ButtonLoading: React.FC<{ text?: string }> = ({ text = 'Processing...' }) => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    <span>{text}</span>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <div className="h-48 bg-gray-200 animate-pulse"></div>
    <CardContent className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    </CardContent>
  </Card>
);

export default EnhancedLoading;