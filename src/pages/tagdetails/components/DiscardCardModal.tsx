import { useState, useEffect } from "react";
import { Modal, Form, Select, Input, Button, App as AntdApp } from "antd";
import { useGetAmDiscardReasonsQuery } from "../../../services/amDiscardReasonService";
import { useDiscardCardMutation } from "../../../services/cardService";
import { DiscardCardDto } from "../../../data/card/card.request";
import { useAppSelector } from "../../../core/store";
import { selectCurrentUser } from "../../../core/authReducer";
import Strings from "../../../utils/localizations/Strings";
import AnatomyNotification from "../../components/AnatomyNotification";
import { BsCardText, BsTextareaResize } from "react-icons/bs";

const { TextArea } = Input;
const { Option } = Select;

interface DiscardCardModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  cardId: number;
  siteId: number;
}

const DiscardCardModal = ({
  isVisible,
  onCancel,
  onSuccess,
  cardId,
  siteId,
}: DiscardCardModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);
  const { notification } = AntdApp.useApp();

  // Get discard reasons for the site
  const {
    data: discardReasons = [],
    isLoading: isLoadingReasons,
    error: reasonsError,
  } = useGetAmDiscardReasonsQuery(siteId, {
    skip: !siteId || !isVisible,
  });

  const [discardCard] = useDiscardCardMutation();

  useEffect(() => {
    if (reasonsError) {
      AnatomyNotification.error(notification, Strings.errorLoadingDiscardReasons);
    }
  }, [reasonsError, notification]);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      console.log("🔍 Modal Submit Debug:", {
        cardId,
        cardIdType: typeof cardId,
        siteId,
        siteIdType: typeof siteId,
        values,
        currentUser: currentUser.userId
      });

      if (!values.amDiscardReasonId) {
        AnatomyNotification.error(notification, Strings.pleaseSelectDiscardReason);
        return;
      }

      // Validate that cardId and siteId are valid numbers
      if (!cardId || isNaN(cardId) || cardId <= 0) {
        console.error("❌ Invalid cardId:", cardId);
        AnatomyNotification.error(notification, "Invalid card ID");
        return;
      }

      if (!siteId || isNaN(siteId) || siteId <= 0) {
        console.error("❌ Invalid siteId:", siteId);
        AnatomyNotification.error(notification, "Invalid site ID");
        return;
      }

      const discardDto = {
        cardId: Number(cardId),
        amDiscardReasonId: Number(values.amDiscardReasonId),
        managerId: Number(currentUser.userId),
        managerName: String(currentUser.name),
        cardManagerCloseDate: new Date().toISOString(),
        ...(values.commentsManagerAtCardClose?.trim() && {
          commentsManagerAtCardClose: values.commentsManagerAtCardClose.trim()
        })
      };

      console.log("🔍 Final Discard DTO:", discardDto);
      console.log("🔍 DTO JSON:", JSON.stringify(discardDto, null, 2));

      await discardCard(discardDto).unwrap();

      notification.success({
        message: Strings.success,
        description: Strings.cardDiscardedSuccessfully,
      });
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("❌ Error discarding card:", error);
      AnatomyNotification.error(notification, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      form.resetFields();
      onCancel();
    }
  };

  return (
    <Modal
      title={Strings.discardCardModalTitle}
      open={isVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
          {Strings.cancel}
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={isLoading}
          onClick={() => form.submit()}
        >
          {Strings.discardCard}
        </Button>,
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isLoading}
      >
        <Form.Item
          name="amDiscardReasonId"
          label={Strings.selectDiscardReason}
          rules={[
            {
              required: true,
              message: Strings.pleaseSelectDiscardReason,
            },
          ]}
        >
          <Select
            placeholder={Strings.selectDiscardReason}
            loading={isLoadingReasons}
            showSearch
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase()) ?? false
            }
          >
            {discardReasons.map((reason) => (
              <Option key={reason.id} value={reason.id}>
                {reason.discardReason}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="commentsManagerAtCardClose"
          label={Strings.commentsManagerAtCardClose}
          rules={[
            {
              max: 200,
              message: Strings.maxCharactersAllowed.replace("{0}", "200"),
            },
          ]}
        >
          <TextArea
            placeholder={Strings.commentsManagerAtCardClose}
            maxLength={200}
            rows={3}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DiscardCardModal; 