
/**
 * Error handler utility for consistent error handling across the app
 */
import { toast } from "@/components/ui/use-toast";
import logger from "./logger";

interface ErrorOptions {
  showToast?: boolean;
  toastTitle?: string;
  context?: string;
}

export const handleError = (error: any, options: ErrorOptions = {}) => {
  const { 
    showToast = true, 
    toastTitle = "Error", 
    context = "general" 
  } = options;

  // Log the error with context
  logger.error(`${context} error:`, error);

  // Determine the error message to display
  let errorMessage = "An unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error_description) {
    errorMessage = error.error_description;
  } else if (error?.details) {
    errorMessage = error.details;
  }

  // Show toast if requested
  if (showToast) {
    toast({
      title: toastTitle,
      description: errorMessage,
      variant: "destructive",
    });
  }

  // Return formatted error for further handling if needed
  return {
    message: errorMessage,
    original: error
  };
};

export const handleAuthError = (error: any, options: ErrorOptions = {}) => {
  const authContext = options.context || "authentication";
  
  // Handle specific auth error cases
  let errorMessage = "Authentication error";
  let toastTitle = options.toastTitle || "Authentication Error";
  
  if (error?.message?.includes("JWT")) {
    errorMessage = "Your session has expired. Please sign in again.";
    toastTitle = "Session Expired";
  } else if (error?.message?.includes("valid UUID")) {
    errorMessage = "Invalid user ID. Please sign in again.";
    toastTitle = "Authentication Error";
  }
  
  return handleError(error, {
    ...options,
    context: authContext,
    toastTitle
  });
};

export default {
  handleError,
  handleAuthError
};
