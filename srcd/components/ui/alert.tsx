import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-gray-800 border-gray-700 text-white",
        destructive: "border-red-700 bg-red-900/50 text-red-100 [&>svg]:text-red-100",
        success: "border-green-700 bg-green-900/50 text-green-100 [&>svg]:text-green-100",
        warning: "border-yellow-700 bg-yellow-900/50 text-yellow-100 [&>svg]:text-yellow-100",
        info: "border-blue-700 bg-blue-900/50 text-blue-100 [&>svg]:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      onClose?: () => void;
    }
>(({ className, variant, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {children}
    {onClose && (
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
        aria-label="Close alert"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };