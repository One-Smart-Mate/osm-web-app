import type { NotificationInstance } from "antd/es/notification/interface";
import { format } from "date-fns";
import CryptoJS from "crypto-js";
import Strings from "../../utils/localizations/Strings";
import { isNetworkError, getNetworkErrorType, getErrorMessage, parseRTKError } from "../../utils/networkErrorHandler";

/**
 * Notification types for the application
 */
export enum AnatomyNotificationType {
  _REGISTER,
  _UPDATE,
  _SUCCESS_DELETE,
  _RESET_PASSWORD,
}

/**
 * Get success message based on notification type using i18n
 */
const getSuccessMessage = (type: AnatomyNotificationType): string => {
  if (type == AnatomyNotificationType._REGISTER) {
    return Strings.successfullyRegistered;
  }

  if (type == AnatomyNotificationType._UPDATE) {
    return Strings.successfullyUpdated;
  }

  if (type == AnatomyNotificationType._SUCCESS_DELETE) {
    return Strings.successfullyDeleted;
  }

  if (type == AnatomyNotificationType._RESET_PASSWORD) {
    return Strings.passwordResetSuccess;
  }

  return Strings.successfullyCompleted;
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

    // Check if it's a network error
    if (isNetworkError(valueOrText)) {
      const errorType = getNetworkErrorType(valueOrText);
      const errorMessage = getErrorMessage(errorType);

      notification.error({
        message: Strings.error,
        description: errorMessage,
        duration: 5,
      });
      return;
    }

    // Handle RTK Query errors and object errors
    let description = '';

    if (valueOrText?.data?.message) {
      description = valueOrText.data.message;
    } else if (typeof valueOrText === 'object' && valueOrText !== null) {
      // Parse RTK error to avoid [object Object] messages
      description = parseRTKError(valueOrText);
    } else {
      description = `${valueOrText || Strings.errorOccurred || "Unknown error"} ${text || ""}`.trim();
    }

    notification.error({
      message: Strings.notificationErrorTitle || "Error!",
      description,
      duration: 4,
    });
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
          } catch (_serializeError) {
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
   * Display success notification with i18n support
   */
  static success(
    notification: NotificationInstance,
    value: AnatomyNotificationType
  ) {
    notification.open({
      message: Strings.notificationSuccessTitle || "Success!",
      description: getSuccessMessage(value),
      type: "success",
    });
  }
}

export default AnatomyNotification;
