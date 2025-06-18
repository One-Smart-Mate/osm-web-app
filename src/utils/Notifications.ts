import { notification } from "antd";

export const handleErrorNotification = (value: any, text?: string) => {
  if (value.hasOwnProperty("data") && value.data.hasOwnProperty("message")) {
    notification.open({
      message: "Ups!",
      description: value.data.message,
      type: "error",
    });
  } else {
    notification.open({
      message: "Ups!",
      description: `${value} ${text}`,
      type: "error",
    });
  }
};

export const handleWarningNotification = (value: string) => {
  notification.open({
    message: "Warning!",
    description: value,
    type: "warning",
  });
};

export const handleSucccessNotification = (value: NotificationSuccess | string) => {
  notification.open({
    message: "Success!",
    description: typeof value === 'string' ? value : getSuccessMessage(value),
    type: "success",
  });
};

export enum NotificationSuccess {
  REGISTER,
  UPDATE,
  SUCCESS_DELETE,
  RESET_PASSWORD,
}

export const getSuccessMessage = (type: NotificationSuccess): string => {
  if (type == NotificationSuccess.REGISTER) {
    return "Successfully registered";
  }

  if (type == NotificationSuccess.UPDATE) {
    return "Successfully updated";
  }

  if (type == NotificationSuccess.SUCCESS_DELETE) {
    return "Successfully deleted";
  }

  if (type == NotificationSuccess.RESET_PASSWORD) {
    return "Your password has been reset successfully. You can now log in with your new password";
  }

  return "Successfully completed";
};
