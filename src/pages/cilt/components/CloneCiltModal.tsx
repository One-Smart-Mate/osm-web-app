import React, { useState } from 'react';
import { Modal, Button, Spin, Typography } from 'antd';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import Strings from '../../../utils/localizations/Strings';
import { useCiltCloning } from '../../../services/cilt/ciltCloningService';

interface CloneCiltModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const { Text } = Typography;

const CloneCiltModal: React.FC<CloneCiltModalProps> = ({
  visible,
  cilt,
  onCancel,
  onSuccess,
}) => {
  const [isCloning, setIsCloning] = useState(false);
  const { cloneCilt } = useCiltCloning();

  const handleClone = async () => {
    if (!cilt) return;
    
    setIsCloning(true);
    try {
      const success = await cloneCilt(cilt);
      if (success) {
        onSuccess();
      }
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Modal
      title={Strings.levelsTreeOptionClone}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {Strings.cancel}
        </Button>,
        <Button
          key="clone"
          type="primary"
          onClick={handleClone}
          loading={isCloning}
        >
          {Strings.levelsTreeOptionClone}
        </Button>,
      ]}
      width={500}
    >
      {isCloning ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip={Strings.cloningLevelsMessage} />
        </div>
      ) : (
        <div style={{ padding: '10px 0' }}>
          <Text>
            {Strings.confirmCloneCiltMstrMessage}
          </Text>
          <div style={{ marginTop: '15px' }}>
            <Text type="secondary">
              {Strings.confirmCloneSecuencesMessage}
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CloneCiltModal;
