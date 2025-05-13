import { NotificationInstance } from "antd/es/notification/interface";


export enum AnatomyNotificationType {
  REGISTER,
  UPDATE,
  SUCCESS_DELETE,
  RESET_PASSWORD,
}

const getSuccessMessage = (type: AnatomyNotificationType): string => {
  if (type == AnatomyNotificationType.REGISTER) {
    return "Successfully registered";
  }

  if (type == AnatomyNotificationType.UPDATE) {
    return "Successfully updated";
  }

  if (type == AnatomyNotificationType.SUCCESS_DELETE) {
    return "Successfully deleted";
  }

  if (type == AnatomyNotificationType.RESET_PASSWORD) {
    return "Your password has been reset successfully. You can now log in with your new password";
  }

  return "Successfully completed";
};

class AnatomyNotification {

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

  static handlePrintError = (valueOrText: any) => {
    try {
      if (valueOrText && typeof valueOrText === "object" && !Array.isArray(valueOrText)) {
        console.error(`[ERROR] ${Object.values(valueOrText)}`)
      } else {
        console.error(`[ERROR] ${valueOrText}`)
      }
    } catch(error) {
      console.error(`[ERROR] ${error}`);
    }
  }

  static success(notification: NotificationInstance, value: AnatomyNotificationType) {
    notification.open({
      message: "Success!",
      description: getSuccessMessage(value),
      type: "success",
    });
  }
}

export default AnatomyNotification;

