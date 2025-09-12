import { notification } from "antd";
import Strings from "./localizations/Strings";

export const handleErrorNotification = (value: any, text?: string) => {
  if (Object.prototype.hasOwnProperty.call(value, "data") &&
  Object.prototype.hasOwnProperty.call(value.data, "message")) {
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
  _REGISTER,
  _UPDATE,
  _SUCCESS_DELETE,
  _RESET_PASSWORD,
}

export const getSuccessMessage = (type: NotificationSuccess): string => {
  if (type == NotificationSuccess._REGISTER) {
    return Strings.successfullyRegistered;
  }

  if (type == NotificationSuccess._UPDATE) {
    return Strings.successfullyUpdated;
  }

  if (type == NotificationSuccess._SUCCESS_DELETE) {
    return Strings.successfullyDeleted;
  }

  if (type == NotificationSuccess._RESET_PASSWORD) {
    return Strings.passwordResetSuccess;
  }

  return Strings.successfullyCompleted;
};
