import { NotificationInstance } from "antd/es/notification/interface";

class AnatomyNotification {

  static error(notification: NotificationInstance, valueOrText?: any, text?: string) {
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
}

export default AnatomyNotification;