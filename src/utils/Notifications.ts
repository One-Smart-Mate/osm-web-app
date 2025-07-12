import { notification } from "antd";
import Strings from "./localizations/Strings";

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
    return Strings.successfullyRegistered;
  }

  if (type == NotificationSuccess.UPDATE) {
    return Strings.successfullyUpdated;
  }

  if (type == NotificationSuccess.SUCCESS_DELETE) {
    return Strings.successfullyDeleted;
  }

  if (type == NotificationSuccess.RESET_PASSWORD) {
    return Strings.passwordResetSuccess;
  }

  return Strings.successfullyCompleted;
};
