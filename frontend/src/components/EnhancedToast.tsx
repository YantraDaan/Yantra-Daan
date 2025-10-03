import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, XCircle, Info, Gift, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'donation' | 'request' | 'impact';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface EnhancedToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const EnhancedToast: React.FC<EnhancedToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss
    if (toast.duration && toast.duration > 0) {
      const dismissTimer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative overflow-hidden border-l-4 shadow-lg";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-900`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-900`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-900`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-900`;
      case 'donation':
        return `${baseStyles} bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary text-primary-foreground`;
      case 'request':
        return `${baseStyles} bg-gradient-to-r from-accent/10 to-blue-500/10 border-accent text-accent-foreground`;
      case 'impact':
        return `${baseStyles} bg-gradient-to-r from-secondary/10 to-green-500/10 border-secondary text-secondary-foreground`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-900`;
    }
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-green-600" />;
      case 'error':
        return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-red-600" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-yellow-600" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-600" />;
      case 'donation':
        return <Gift {...iconProps} className="w-5 h-5 flex-shrink-0 text-primary" />;
      case 'request':
        return <Users {...iconProps} className="w-5 h-5 flex-shrink-0 text-accent" />;
      case 'impact':
        return <Heart {...iconProps} className="w-5 h-5 flex-shrink-0 text-secondary" />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      case 'donation': return 'bg-gradient-to-r from-primary to-primary-glow';
      case 'request': return 'bg-gradient-to-r from-accent to-blue-500';
      case 'impact': return 'bg-gradient-to-r from-secondary to-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`
        transition-all duration-300 transform
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'scale-95' : 'scale-100'}
      `}
    >
      <Card className={`${getToastStyles()} min-w-[350px] max-w-[500px]`}>
        {/* Progress bar for auto-dismiss */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
        
        {/* Glowing effect for special types */}
        {['donation', 'request', 'impact'].includes(toast.type) && (
          <div className={`absolute inset-0 ${getProgressBarColor()} opacity-20 animate-pulse`} />
        )}
        
        <div className="p-4 relative z-10">
          <div className="flex items-start space-x-3">
            {getIcon()}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">{toast.title}</h4>
              <p className="text-sm opacity-90 leading-relaxed">{toast.message}</p>
              
              {toast.action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toast.action.onClick}
                    className="text-xs font-medium"
                  >
                    {toast.action.label}
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 h-auto opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right'
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 pointer-events-none ${getPositionClasses()}`}
      style={{ maxHeight: 'calc(100vh - 2rem)' }}
    >
      <div className="space-y-3 pointer-events-auto overflow-hidden">
        {toasts.map((toast) => (
          <EnhancedToast
            key={toast.id}
            toast={toast}
            onClose={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for managing toasts
export const useEnhancedToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods for different types
  const success = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'success', title, message, action });
  };

  const error = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'error', title, message, duration: 7000, action });
  };

  const warning = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'warning', title, message, action });
  };

  const info = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'info', title, message, action });
  };

  const donation = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'donation', title, message, action });
  };

  const request = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'request', title, message, action });
  };

  const impact = (title: string, message: string, action?: ToastData['action']) => {
    addToast({ type: 'impact', title, message, action });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    donation,
    request,
    impact
  };
};

// CSS for progress bar animation
const styles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default EnhancedToast;