import { Modal, Button, Descriptions, Tag, Row, Col} from "antd";
import { CiltSequenceExecution } from "../../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";
import Strings from "../../../utils/localizations/Strings";
import { format } from "date-fns";

interface ExecutionDetailsModalProps {
  isVisible: boolean;
  execution: CiltSequenceExecution | null;
  onClose: () => void;
}

/**
 * Modal component for displaying CILT execution details
 */
export const ExecutionDetailsModal: React.FC<ExecutionDetailsModalProps> = ({
  isVisible,
  execution,
  onClose,
}) => {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return Strings.oplFormNotAssigned;
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      return Strings.oplFormNotAssigned;
    }
  };

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return Strings.oplFormNotAssigned;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      title={Strings.executionDetails}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} type="primary" style={{ float: 'right', top: '-40px' }}>
          {Strings.close}
        </Button>
      ]}
      width={800}
    >
      {execution && (
        <div>
          {/* ID and route section */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="ID (site_execution_id)">{execution.siteExecutionId || execution.id || Strings.oplFormNotAssigned}</Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="route">{execution.route || Strings.oplFormNotAssigned}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          
          <div style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              {/* Left column */}
              <Col span={12}>
                {/* Sequence list box */}
                <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px', marginBottom: 16 }}>
                  <div style={{ padding: '8px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
                    {Strings.sequenceList}
                  </div>
                  <div style={{ padding: '12px', whiteSpace: 'pre-wrap', minHeight: 100 }}>
                    {execution.secuenceList || Strings.oplFormNotAssigned}
                  </div>
                </div>
                
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label={Strings.referencePoint}>
                    {execution.referencePoint || Strings.oplFormNotAssigned}
                  </Descriptions.Item>
                </Descriptions>
                
                <div style={{ marginTop: 58 }}> {/* Espacio para el botón "ver diagrama" */}</div>
                
                <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
                  <Descriptions.Item label={Strings.standardOk}>
                    {execution.standardOk || Strings.oplFormNotAssigned}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.initialParameter}>
                    {execution.initialParameter || Strings.oplFormNotAssigned}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.finalParameter}>
                    {execution.finalParameter || Strings.oplFormNotAssigned}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.status}>
                    {execution.status === "A" ? Strings.active : Strings.inactive}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              
              {/* Right column */}
              <Col span={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label={Strings.sequenceSchedule}>
                    {formatDate(execution.secuenceSchedule)}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.machineStatus}>
                    {execution.machineStatus === null || execution.machineStatus === undefined ? 
                      (execution.machineStopped === false ? 
                        <Tag color="green">{Strings.running}</Tag> : 
                        Strings.oplFormNotAssigned
                      ) : 
                      execution.machineStatus
                    }
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.ciltTypeName}>
                    <Row align="middle" gutter={8}>
                      <Col>{execution.ciltTypeName || Strings.oplFormNotAssigned}</Col>
                      <Col>
                        {execution.secuenceColor && (
                          <div style={{ 
                            backgroundColor: `#${execution.secuenceColor}`, 
                            width: '20px', 
                            height: '20px', 
                            display: 'inline-block',
                            verticalAlign: 'middle'
                          }} />
                        )}
                      </Col>
                    </Row>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.duration}>
                    {formatDuration(execution.duration)}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.secuenceStart}>
                    {formatDate(execution.secuenceStart)}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.secuenceStop}>
                    {formatDate(execution.secuenceStop)}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.realDuration}>
                    {formatDuration(execution.realDuration)}
                  </Descriptions.Item>
                </Descriptions>
                
                {/* Action buttons would go here */}
              </Col>
            </Row>
          </div>
          
          {/* Additional information if needed */}
          <div style={{ marginTop: 16, display: 'none' }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label={Strings.createdAt}>{formatDate(execution.createdAt)}</Descriptions.Item>
              <Descriptions.Item label={Strings.updatedAt}>{formatDate(execution.updatedAt)}</Descriptions.Item>
              <Descriptions.Item label={Strings.editCiltSequenceModalToolsRequiredLabel} span={2}>
                {execution.toolsRequiered || Strings.oplFormNotAssigned}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ExecutionDetailsModal;
