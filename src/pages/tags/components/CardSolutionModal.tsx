import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Upload, Typography, Space } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import Strings from '../../../utils/localizations/Strings';
import { CardInterface } from '../../../data/card/card';
import {
  useUpdateDefinitiveSolutionMutation,
  useUpdateProvisionalSolutionMutation
} from '../../../services/cardService';
import { useGetSiteResponsiblesMutation } from '../../../services/userService';
import { EvidenceType } from '../../../data/card/card.request';
import { handleErrorNotification, handleSucccessNotification } from '../../../utils/Notifications';
import useCurrentUser from '../../../utils/hooks/useCurrentUser';
import { uploadFileToFirebaseWithPath } from '../../../config/firebaseUpload';
import { CardCache } from '../../../utils/cardCache';

interface CardSolutionModalProps {
  visible: boolean;
  onClose: () => void;
  card: CardInterface;
  solutionType: 'provisional' | 'definitive';
  onSuccess?: () => void;
}

const CardSolutionModal: React.FC<CardSolutionModalProps> = ({
  visible,
  onClose,
  card,
  solutionType,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { user } = useCurrentUser();
  const [updateDefinitiveSolution, { isLoading: isUpdatingDefinitive }] = useUpdateDefinitiveSolutionMutation();
  const [updateProvisionalSolution, { isLoading: isUpdatingProvisional }] = useUpdateProvisionalSolutionMutation();
  const [getSiteResponsibles, { isLoading: isLoadingUsers }] = useGetSiteResponsiblesMutation();
  const [fileList, setFileList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const isLoading = isUpdatingDefinitive || isUpdatingProvisional;
  const isDefinitive = solutionType === 'definitive';

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
      loadUsers();
    }
  }, [visible, form]);

  // Set default responsible user when users are loaded
  useEffect(() => {
    if (users.length > 0 && card.mechanicName) {
      // Find the user that matches the card's mechanic name
      const defaultUser = users.find(
        (user) => user.name.toLowerCase() === card.mechanicName.toLowerCase()
      );

      if (defaultUser) {
        form.setFieldsValue({
          responsibleUser: defaultUser.id.toString(),
        });
      }
    }
  }, [users, card.mechanicName, form]);

  const loadUsers = async () => {
    try {
      const response = await getSiteResponsibles(card.siteId.toString()).unwrap();
      setUsers(response);
    } catch (_error) {
      handleErrorNotification(Strings.errorLoadingUsers);
    }
  };

  const getEvidenceType = (file: any): EvidenceType => {
    const fileName = file.name?.toLowerCase() || '';
    const fileType = file.type?.toLowerCase() || '';

    // Determine if it's image, video, or audio
    const isImage = fileType.startsWith('image/') ||
                   fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
    const isVideo = fileType.startsWith('video/') ||
                   fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/);
    const isAudio = fileType.startsWith('audio/') ||
                   fileName.match(/\.(mp3|wav|ogg|aac|flac)$/);

    // Return appropriate evidence type based on solution type and media type
    if (isDefinitive) {
      if (isImage) return 'IMCL'; // Image Close
      if (isVideo) return 'VICL'; // Video Close
      if (isAudio) return 'AUCL'; // Audio Close
    } else {
      if (isImage) return 'IMPS'; // Image Provisional Solution
      if (isVideo) return 'VIPS'; // Video Provisional Solution
      if (isAudio) return 'AUPS'; // Audio Provisional Solution
    }

    // Default to image close if type cannot be determined
    return isDefinitive ? 'IMCL' : 'IMPS';
  };

  const handleSubmit = async (values: any) => {
    if (!user?.userId) {
      handleErrorNotification(Strings.userNotIdentified);
      return;
    }

    try {
      // Upload files to Firebase first and get URLs
      const evidences = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          try {
            // Create a path for the evidence file matching Android structure
            const evidenceType = getEvidenceType(file);
            const folder = evidenceType.startsWith('IM') ? 'images' :
                          evidenceType.startsWith('VI') ? 'videos' : 'audios';
            const path = `site_${card.siteId}/cards/${card.cardUUID}/${folder}/${Date.now()}_${file.name}`;

            // Upload to Firebase
            const downloadURL = await uploadFileToFirebaseWithPath(path, file);

            evidences.push({
              type: getEvidenceType(file),
              url: downloadURL,
            });
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            handleErrorNotification(`Error uploading file: ${file.name}`);
            return;
          }
        }
      }

      if (isDefinitive) {
        const requestData = {
          cardId: parseInt(card.id.toString()),
          userDefinitiveSolutionId: parseInt(values.responsibleUser),
          userAppDefinitiveSolutionId: parseInt(user.userId),
          comments: values.comments || '',
          evidences,
        };
        await updateDefinitiveSolution(requestData).unwrap();
      } else {
        const requestData = {
          cardId: parseInt(card.id.toString()),
          userProvisionalSolutionId: parseInt(values.responsibleUser),
          userAppProvisionalSolutionId: parseInt(user.userId),
          comments: values.comments || '',
          evidences,
        };
        await updateProvisionalSolution(requestData).unwrap();
      }

      handleSucccessNotification(
        `${isDefinitive ? Strings.definitiveSolution : Strings.provisionalSolution} ${Strings.appliedCorrectly}`
      );

      // Clear cache before reloading to ensure fresh data is loaded
      await CardCache.clearSiteCache(parseInt(card.siteId.toString()));

      onSuccess?.();
      onClose();

      // Force page refresh to show updated card data
      window.location.reload();
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={`${isDefinitive ? Strings.definitiveSolutionTitle : Strings.provisionalSolutionTitle} - ${card.cardTypeMethodologyName} ${card.siteCardId}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {Strings.cancel}
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={isLoading}
          onClick={() => form.submit()}
        >
          {Strings.save}
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text type="secondary">
          {Strings.cardLabel} {card.cardTypeMethodologyName} {card.siteCardId}
        </Typography.Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="responsibleUser"
            label={Strings.responsibleUser}
            rules={[{ required: true, message: Strings.selectResponsibleUser }]}
            tooltip={card.mechanicName ? `Responsable actual: ${card.mechanicName}` : undefined}
          >
            <Select
              placeholder={Strings.selectResponsibleUserPlaceholder}
              loading={isLoadingUsers}
              showSearch
              filterOption={(input, option) =>
                (option?.children?.toString() || '')?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Select.Option key={user.id} value={user.id.toString()}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="comments"
            label={Strings.commentsLabel}
            rules={[{ required: true, message: Strings.enterComments }]}
          >
            <Input.TextArea
              rows={4}
              placeholder={Strings.describeSolution}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label={Strings.evidencesOptional}
          >
            <Upload
              multiple
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false} // Prevent auto upload - we'll upload manually
              accept="image/*,video/*,audio/*"
              maxCount={5} // Limit number of files
            >
              <Button icon={<UploadOutlined />}>
                {Strings.selectFiles}
              </Button>
            </Upload>
            {fileList.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                {fileList.length} {Strings.filesSelected}
              </div>
            )}
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

export default CardSolutionModal;