import React, { ReactNode, useState } from 'react';
import { Button, Modal, Space } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import Strings from '../../../utils/localizations/Strings';

interface ChartExpanderProps {
  children?: ReactNode;
  title: string;
  pieChart?: ReactNode;
  barVChart?: ReactNode;
  barHChart?: ReactNode;
  lineChart?: ReactNode;
  defaultChartType?: 'pie' | 'barV' | 'barH' | 'line';
}

/**
 * A component that provides a button to expand a chart into a full-screen modal
 * for better visualization. Supports multiple chart types with controls.
 */
const ChartExpander: React.FC<ChartExpanderProps> = ({
  children,
  title,
  pieChart,
  barVChart,
  barHChart,
  lineChart,
  defaultChartType = 'pie'
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalChartType, setModalChartType] = useState<'pie' | 'barV' | 'barH' | 'line'>(defaultChartType);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Check if multiple chart types are provided
  const hasMultipleCharts = !!(pieChart || barVChart || barHChart || lineChart);

  // Render the appropriate chart based on modalChartType
  const renderModalChart = () => {
    if (!hasMultipleCharts) return children;

    switch (modalChartType) {
      case 'pie':
        return pieChart || children;
      case 'barV':
        return barVChart || children;
      case 'barH':
        return barHChart || children;
      case 'line':
        return lineChart || children;
      default:
        return children;
    }
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
        styles={{body: { height: 'calc(90vh - 108px)' }}}
      >
        <div className="w-full h-full flex flex-col">
          {/* Chart type controls - only show if multiple charts provided */}
          {hasMultipleCharts && (
            <Space style={{ marginBottom: 16 }} wrap>
              {pieChart && (
                <Button
                  type={modalChartType === 'pie' ? 'primary' : 'default'}
                  onClick={() => setModalChartType('pie')}
                >
                  {Strings.pieChart}
                </Button>
              )}
              {barVChart && (
                <Button
                  type={modalChartType === 'barV' ? 'primary' : 'default'}
                  onClick={() => setModalChartType('barV')}
                >
                  {Strings.verticalBars}
                </Button>
              )}
              {barHChart && (
                <Button
                  type={modalChartType === 'barH' ? 'primary' : 'default'}
                  onClick={() => setModalChartType('barH')}
                >
                  {Strings.horizontalBars}
                </Button>
              )}
              {lineChart && (
                <Button
                  type={modalChartType === 'line' ? 'primary' : 'default'}
                  onClick={() => setModalChartType('line')}
                >
                  Líneas
                </Button>
              )}
            </Space>
          )}

          {/* Chart display area */}
          <div className="flex-1 w-full" style={{ minHeight: 0 }}>
            {renderModalChart()}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChartExpander;
