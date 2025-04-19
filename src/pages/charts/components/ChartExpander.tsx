import React, { ReactNode, useState } from 'react';
import { Button, Modal } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import Strings from '../../../utils/localizations/Strings';

interface ChartExpanderProps {
  children: ReactNode;
  title: string;
}

/**
 * A component that provides a button to expand a chart into a full-screen modal
 * for better visualization.
 */
const ChartExpander: React.FC<ChartExpanderProps> = ({ children, title }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Expand button - can be positioned anywhere */}
      <Button
        type="primary"
        icon={<ExpandOutlined />}
        onClick={showModal}
        size="small"
      >
        {Strings.expand}
      </Button>

      {/* Modal for expanded view */}
      <Modal
        title={title}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ height: 'calc(90vh - 108px)' }} // Adjust height to fit most of the screen
      >
        <div className="w-full h-full">
          {children}
        </div>
      </Modal>
    </>
  );
};

export default ChartExpander;
