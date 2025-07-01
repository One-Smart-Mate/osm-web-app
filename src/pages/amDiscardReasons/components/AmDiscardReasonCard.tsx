import { Card, Space, Typography, Button, Modal } from "antd";
import { AmDiscardReason } from "../../../data/amDiscardReason/amDiscardReason";
import Strings from "../../../utils/localizations/Strings";
import { useState } from "react";
import { useDeleteAmDiscardReasonMutation } from "../../../services/amDiscardReasonService";
import AmDiscardReasonForm, { AmDiscardReasonFormType } from "./AmDiscardReasonForm";
// AnatomyNotification removed - using console.log for now

const { Text } = Typography;

interface AmDiscardReasonCardProps {
  amDiscardReason: AmDiscardReason;
  onComplete: () => void;
}

const AmDiscardReasonCard: React.FC<AmDiscardReasonCardProps> = ({
  amDiscardReason,
  onComplete,
}) => {
  const [deleteAmDiscardReason] = useDeleteAmDiscardReasonMutation();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAmDiscardReason(amDiscardReason.id).unwrap();
      setIsDeleteModalVisible(false);
      onComplete();
      console.log("Discard reason deleted successfully");
    } catch (error: any) {
      console.error("Error deleting discard reason:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Removed menuItems - using direct buttons instead

  return (
    <>
      <Card
        style={{ width: "100%", marginBottom: 16 }}
        actions={[
          <Button
            key="edit"
            type="primary"
            size="small"
            onClick={() => setIsEditModalVisible(true)}
          >
            {Strings.edit}
          </Button>,
          <Button
            key="delete"
            type="primary"
            size="small"
            danger
            onClick={() => setIsDeleteModalVisible(true)}
          >
            {Strings.delete}
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong style={{ fontSize: "16px" }}>
              {amDiscardReason.discardReason}
            </Text>
          </div>
        </Space>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={Strings.confirm}
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={Strings.delete}
        cancelText={Strings.cancel}
        okButtonProps={{ danger: true, loading: isDeleting }}
      >
        <p>
          {Strings.confirm} {Strings.delete.toLowerCase()} "{amDiscardReason.discardReason}"?
        </p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={Strings.updateAmDiscardReason}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <AmDiscardReasonForm
          formType={AmDiscardReasonFormType.UPDATE}
          amDiscardReason={amDiscardReason}
          onComplete={() => {
            setIsEditModalVisible(false);
            onComplete();
          }}
        />
      </Modal>
    </>
  );
};

export default AmDiscardReasonCard; 