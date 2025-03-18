import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
  showClose = true,
  closeOnOverlayClick = true,
}) => {
  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={cn(
          "relative bg-gray-800 rounded-lg shadow-xl w-full",
          sizeClasses[size],
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {title && (
              <h2 className="text-lg font-semibold text-white">
                {title}
              </h2>
            )}
            {showClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Utility components for Modal
export const ModalTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h2
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h2>
);

export const ModalDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p
    className={cn("text-sm text-gray-400", className)}
    {...props}
  >
    {children}
  </p>
);

export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex justify-end gap-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Example usage:
/*
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  footer={
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Modal content goes here</p>
</Modal>
*/