import React from 'react';
import { Card, Typography, Row, Col, Space } from 'antd';
import { CheckCircleFilled, DatabaseOutlined } from '@ant-design/icons';
import Strings from '../../utils/localizations/Strings';

const { Title, Text } = Typography;

// This component displays the system health status
const SystemHealth: React.FC = () => {
  const healthChecks = [
    { 
      name: Strings.databaseConnectionTest, 
      status: true 
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DatabaseOutlined /> {Strings.systemHealthTitle}

      </Title>

      <Row gutter={[24, 24]}>
        {/* System Checks */}
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <DatabaseOutlined />
                <span>{Strings.verificationOfServices}</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              {healthChecks.map((check, index) => (
                <Col span={6} key={index}>
                  <Card size="small">
                    <Space>
                      <CheckCircleFilled style={{ color: check.status ? 'green' : 'red', fontSize: 16 }} />
                      <Text>{check.name}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemHealth;
