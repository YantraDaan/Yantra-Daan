import React from 'react';
import { LucideIcon, Search, Package, Users, FileText, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface NoDataFoundProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'full';
  imageType?: 'search' | 'devices' | 'users' | 'requests' | 'general';
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  icon: Icon,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  actionText,
  onAction,
  className = '',
  variant = 'default',
  imageType = 'general'
}) => {
  const getDefaultIcon = () => {
    switch (imageType) {
      case 'search':
        return Search;
      case 'devices':
        return Package;
      case 'users':
        return Users;
      case 'requests':
        return FileText;
      default:
        return AlertCircle;
    }
  };

  const getDefaultTitle = () => {
    switch (imageType) {
      case 'search':
        return 'No results found';
      case 'devices':
        return 'No devices available';
      case 'users':
        return 'No users found';
      case 'requests':
        return 'No requests found';
      default:
        return 'No data found';
    }
  };

  const getDefaultDescription = () => {
    switch (imageType) {
      case 'search':
        return 'Try adjusting your search criteria or browse all available items.';
      case 'devices':
        return 'There are no devices posted at the moment. Check back later or be the first to donate!';
      case 'users':
        return 'No users match your current criteria.';
      case 'requests':
        return 'No requests have been submitted yet.';
      default:
        return 'There are no items to display at the moment.';
    }
  };

  const renderContent = () => {
    const iconSize = variant === 'compact' ? 'w-8 h-8' : 'w-16 h-16';
    const titleSize = variant === 'compact' ? 'text-base' : 'text-lg';
    const descriptionSize = variant === 'compact' ? 'text-sm' : 'text-base';
    const padding = variant === 'compact' ? 'py-6' : 'py-12';

    // Always show the lens icon (Search) for no data found
    const DisplayIcon = Icon || Search;

    return (
      <div className={`text-center ${padding} ${className}`}>
        <div className="mb-6">
          <div className={`${variant === 'compact' ? 'w-20 h-20' : 'w-24 h-24'} mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4`}>
            <DisplayIcon className={`${iconSize} text-gray-500`} />
          </div>
        </div>
        
        <h3 className={`${titleSize} font-semibold text-gray-900 mb-3`}>
          {title || getDefaultTitle()}
        </h3>
        
        <p className={`${descriptionSize} text-gray-600 mb-6 max-w-md mx-auto leading-relaxed`}>
          {description || getDefaultDescription()}
        </p>
        
        {actionText && onAction && (
          <Button onClick={onAction} size={variant === 'compact' ? 'sm' : 'default'}>
            {actionText}
          </Button>
        )}
      </div>
    );
  };

  if (variant === 'full') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 shadow-sm">
      {renderContent()}
    </div>
  );
};

export default NoDataFound;
