import type { NotificationInstance } from "antd/es/notification/interface";
import { format } from "date-fns";
import CryptoJS from "crypto-js";

/**
 * Notification types for the application
 */
export enum AnatomyNotificationType {
  REGISTER,
  UPDATE,
  SUCCESS_DELETE,
  RESET_PASSWORD,
}

/**
 * Get success message based on notification type
 */
const getSuccessMessage = (type: AnatomyNotificationType, t: (key: string) => string): string => {
  if (type == AnatomyNotificationType.REGISTER) {
    return t("successfullyRegistered");
  }

  if (type == AnatomyNotificationType.UPDATE) {
    return t("successfullyUpdated");
  }

  if (type == AnatomyNotificationType.SUCCESS_DELETE) {
    return t("successfullyDeleted");
  }

  if (type == AnatomyNotificationType.RESET_PASSWORD) {
    return t("passwordResetSuccess");
  }

  return t("successfullyCompleted");
};

/**
 * Main notification class for handling errors and success messages
 * Includes encrypted error logging functionality
 */
class AnatomyNotification {
  // Secret key for encryption from environment variables with fallback
  private static readonly ENCRYPTION_KEY = import.meta.env.VITE_ERROR_LOGS_ENCRYPTION_KEY as string || "OSM_ERROR_LOGS_KEY";
  private static readonly STORAGE_KEY = "osm_error_logs";
  private static errorLogs: {timestamp: string, error: string}[] = [];

  // Load logs from localStorage when class is loaded
  static {
    try {
      this.loadLogsFromStorage();
    } catch (error) {
      console.error("[ERROR] Failed to load logs from localStorage", error);
      // Initialize with empty array if there's an error
      this.errorLogs = [];
    }
  }

  /**
   * Save logs to localStorage with encryption
   */
  private static saveLogsToStorage() {
    try {
      // Encrypt logs before saving
      const encryptedLogs = CryptoJS.AES.encrypt(
        JSON.stringify(AnatomyNotification.errorLogs),
        AnatomyNotification.ENCRYPTION_KEY
      ).toString();

      // Save to localStorage
      localStorage.setItem(AnatomyNotification.STORAGE_KEY, encryptedLogs);
    } catch (error) {
      console.error("Error saving logs to storage:", error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private static loadLogsFromStorage() {
    try {
      // Try to load saved logs
      const storedLogs = localStorage.getItem(AnatomyNotification.STORAGE_KEY);
      if (storedLogs) {
        // Decrypt the logs
        const bytes = CryptoJS.AES.decrypt(storedLogs, AnatomyNotification.ENCRYPTION_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedData) {
          AnatomyNotification.errorLogs = JSON.parse(decryptedData);
        }
      }
    } catch (error) {
      console.error("Error loading stored logs:", error);
      // If there's an error, start with empty logs
      AnatomyNotification.errorLogs = [];
    }
  }

  /**
   * Get all error logs for export
   */
  static getErrorLogs() {
    return [...this.errorLogs];
  }

  /**
   * Clear all error logs
   */
  static clearErrorLogs() {
    this.errorLogs = [];
    this.saveLogsToStorage();
    return true;
  }

  /**
   * Display error notification and log the error
   */
  static error(notification: NotificationInstance, valueOrText?: any, text?: string) {
    this.handlePrintError(valueOrText);
    if (valueOrText?.data?.message) {
      notification.open({
        message: "Error!",
        description: valueOrText.data.message,
        type: "error",
      });
    } else {
      notification.open({
        message: "Error!",
        description: `${valueOrText || "Unknown error"} ${text || ""}`,
        type: "error",
      });
    }
  }

  /**
   * Process and log an error with detailed information
   * Only logs actual errors, not success or informational messages
   */
  static handlePrintError = (valueOrText: any) => {
    try {
      // Get current timestamp
      const timestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx");

      // Initialize error message
      let errorMessage = "";
      const errorDetails: string[] = [];

      // Extract useful information based on error type
      if (valueOrText === null || valueOrText === undefined) {
        errorMessage = `[ERROR] ${valueOrText}`;
      } else if (typeof valueOrText === "object") {
        // Handle error objects

        // Check if it's an HTTP error with status
        if ('status' in valueOrText) {
          errorDetails.push(`Status: ${valueOrText.status}`);
        }

        // Extract error message
        if ('message' in valueOrText) {
          errorDetails.push(`Message: ${valueOrText.message}`);
        } else if ('msg' in valueOrText) {
          errorDetails.push(`Message: ${valueOrText.msg}`);
        }

        // Extract URL if exists
        if ('url' in valueOrText) {
          errorDetails.push(`URL: ${valueOrText.url}`);
        } else if ('config' in valueOrText && 'url' in valueOrText.config) {
          errorDetails.push(`URL: ${valueOrText.config.url}`);
        }

        // Extract stack trace
        if ('stack' in valueOrText) {
          // Get only the first few lines of the stack
          const stackLines = valueOrText.stack.split('\n').slice(0, 3);
          errorDetails.push(`Stack: ${stackLines.join(' | ')}`);
        }

        // If no useful information was found, use a complete JSON stringify
        if (errorDetails.length === 0) {
          try {
            // Create a WeakSet to detect circular references
            const seen = new WeakSet();

            // Try to serialize the complete object
            const serializeObj = JSON.stringify(valueOrText, (_, value) => {
              // Avoid circular references
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]';
                }
                seen.add(value);
              }
              return value;
            }, 2);
            errorDetails.push(serializeObj);
          } catch (serializeError) {
            // If serialization fails, use the base values
            errorDetails.push(`Non-serializable object: ${Object.keys(valueOrText).join(', ')}`);
          }
        }

        // Build final message
        errorMessage = `[ERROR] ${errorDetails.join(' | ')}`;
      } else {
        // For strings and other primitive types
        errorMessage = `[ERROR] ${valueOrText}`;
      }

      // Show in console
      console.error(errorMessage);
      
      // Save to log with timestamp
      AnatomyNotification.errorLogs.push({
        timestamp,
        error: errorMessage
      });
      
      // Save updated logs
      AnatomyNotification.saveLogsToStorage();
      
      return errorMessage;
    } catch (e) {
      console.error("Error in handlePrintError:", e);
      return `[ERROR] ${valueOrText}`;
    }
  };

  /**
   * Display success notification
   */
  static success(
    notification: NotificationInstance, 
    value: AnatomyNotificationType, 
    t?: (key: string) => string
  ) {
    // Default translation function if none provided
    const translate = t || ((key: string) => {
      // Fallback to English if no translation function provided
      const fallbacks: Record<string, string> = {
        successfullyRegistered: "Successfully registered",
        successfullyUpdated: "Successfully updated",
        successfullyDeleted: "Successfully deleted",
        passwordResetSuccess: "Your password has been reset successfully. You can now log in with your new password",
        successfullyCompleted: "Successfully completed",
        success: "Success!"
      };
      return fallbacks[key] || key;
    });

    notification.open({
      message: translate("success"),
      description: getSuccessMessage(value, translate),
      type: "success",
    });
  }
}

export default AnatomyNotification;
