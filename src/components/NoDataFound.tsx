import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './ui/button';

interface NoDataFoundProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'full';
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  icon: Icon,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  actionText,
  onAction,
  className = '',
  variant = 'default'
}) => {
  const renderContent = () => {
    const iconSize = variant === 'compact' ? 'w-8 h-8' : 'w-16 h-16';
    const titleSize = variant === 'compact' ? 'text-base' : 'text-lg';
    const descriptionSize = variant === 'compact' ? 'text-sm' : 'text-base';
    const padding = variant === 'compact' ? 'py-6' : 'py-12';

    return (
      <div className={`text-center ${padding} ${className}`}>
        {Icon && (
          <Icon className={`${iconSize} mx-auto mb-4 opacity-50 text-muted-foreground`} />
        )}
        
        <h3 className={`${titleSize} font-medium text-gray-900 mb-2`}>
          {title}
        </h3>
        
        <p className={`${descriptionSize} text-gray-500 mb-4`}>
          {description}
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
    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      {renderContent()}
    </div>
  );
};

export default NoDataFound;
