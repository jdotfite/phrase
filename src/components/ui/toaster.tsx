import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
  } from "@/components/ui/toast";
  import { useToast } from "@/hooks/useToast";
  
  export function Toaster() {
    const { toasts } = useToast();
  
    return (
      <ToastProvider>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          );
        })}
        <ToastViewport />
      </ToastProvider>
    );
  }
  
  // Example usage:
  /*
  import { useToast } from '@/hooks/useToast';
  
  function MyComponent() {
    const { toast } = useToast();
    
    const showToast = () => {
      toast({
        title: "Success!",
        description: "Your action was completed successfully.",
        variant: "success", // or "default", "destructive", "warning", "info"
      });
    };
  
    return <button onClick={showToast}>Show Toast</button>;
  }
  */