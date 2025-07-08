import { Modal, Button, Descriptions, Tag, Row, Col } from "antd";
import { useState } from "react";
import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";
import OplViewerModal from "./OplViewerModal";
import AMTagViewerModal from "./AMTagViewerModal";
import DiagramViewerModal from "./DiagramViewerModal";
import EvidenceViewerModal from "./EvidenceViewerModal";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import { CiltSequenceExecution } from "../../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";
import Strings from "../../../utils/localizations/Strings";
import { format } from "date-fns";

// Evidence interface
interface Evidence {
  id: number;
  siteId: number;
  positionId: number;
  ciltId: number;
  ciltSequencesExecutionsId: number;
  evidenceUrl: string;
  type: 'INITIAL' | 'FINAL' | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

// Extended OplMstr type to include details property
interface ExtendedOplMstr extends OplMstr {
  details?: OplDetail[];
}

// Extended CiltSequenceExecution type to include evidences property
interface ExtendedCiltSequenceExecution extends CiltSequenceExecution {
  evidences?: Evidence[];
}

interface ExecutionDetailsModalProps {
  isVisible: boolean;
  execution: ExtendedCiltSequenceExecution | null;
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
  // State for OPL modals
  const [isReferenceOplModalVisible, setIsReferenceOplModalVisible] = useState(false);
  const [isRemediationOplModalVisible, setIsRemediationOplModalVisible] = useState(false);
  const [currentOplData, setCurrentOplData] = useState<ExtendedOplMstr | null>(null);
  const [oplModalTitle, setOplModalTitle] = useState("");
  
  // State for AM Tag modal
  const [isAmTagModalVisible, setIsAmTagModalVisible] = useState(false);
  
  // State for Diagram modal
  const [isDiagramModalVisible, setIsDiagramModalVisible] = useState(false);
  
  // State for Evidence modal
  const [isEvidenceModalVisible, setIsEvidenceModalVisible] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<Evidence | null>(null);
  const [evidenceModalTitle, setEvidenceModalTitle] = useState("");

  // Get OPL data mutation
  const [getOplMstrById] = useGetOplMstrByIdMutation();

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

  // Handle fetching and showing OPL data
  const handleViewOpl = async (oplId: number | null, isReference: boolean) => {
    if (!oplId) return;

    try {
      // Set the appropriate modal title before fetching data
      setOplModalTitle(isReference ?  Strings.ciltCardListReferenceOplLabel : Strings.ciltCardListRemediationOplLabel);

      // Fetch OPL data
      const oplData = await getOplMstrById(String(oplId)).unwrap();

      // Cast the data to ExtendedOplMstr since we know the structure from the API response
      const typedOplData = oplData as unknown as ExtendedOplMstr;
      setCurrentOplData(typedOplData);

      // Show the appropriate modal
      if (isReference) {
        setIsReferenceOplModalVisible(true);
      } else {
        setIsRemediationOplModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching OPL data:", error);
    }
  };

  // Handle closing OPL modal
  const handleOplModalClose = () => {
    setIsReferenceOplModalVisible(false);
    setIsRemediationOplModalVisible(false);
  };
  
  // Handle diagram view
  const handleViewDiagram = () => {
    if (execution?.ciltId) {
      setIsDiagramModalVisible(true);
    }
  };
  
  // Handle closing diagram modal
  const handleDiagramModalClose = () => {
    setIsDiagramModalVisible(false);
  };
  
  // Handle AM card
  const handleViewAmCard = () => {
    if (execution?.amTagId) {
      setIsAmTagModalVisible(true);
    }
  };
  
  // Handle closing AM Tag modal
  const handleAmTagModalClose = () => {
    setIsAmTagModalVisible(false);
  };

  // Handle evidence view
  const handleViewEvidence = (type: 'INITIAL' | 'FINAL') => {
    if (!execution?.evidences) return;
    
    const evidence = execution.evidences.find(e => e.type === type);
    if (evidence) {
      setCurrentEvidence(evidence);
      setEvidenceModalTitle(type === 'INITIAL' ? Strings.initialEvidenceTitle : Strings.finalEvidenceTitle);
      setIsEvidenceModalVisible(true);
    }
  };

  // Handle closing Evidence modal
  const handleEvidenceModalClose = () => {
    setIsEvidenceModalVisible(false);
    setCurrentEvidence(null);
    setEvidenceModalTitle("");
  };

  return (
    <>
      <Modal
        title={Strings.executionDetails}
        open={isVisible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose} type="primary">
            {Strings.close}
          </Button>
        ]}
        width={1000}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', paddingRight: 20 }}
        style={{ top: 20 }}
      >
        {execution && (
        <div className="overflow-visible">
          {/* ID and route section */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={Strings.execitionId}>{execution.siteExecutionId || execution.id || Strings.oplFormNotAssigned}</Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={Strings.route}>{execution.route || Strings.oplFormNotAssigned}</Descriptions.Item>
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
                
                <div style={{ marginTop: 58 }}></div>
                
                <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
                  <Descriptions.Item label={Strings.standardOk}>
                    {execution.standardOk || Strings.oplFormNotAssigned}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.initialParameter}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{execution.initialParameter || Strings.oplFormNotAssigned}</span>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleViewEvidence('INITIAL')}
                        disabled={!execution.evidences || !execution.evidences.some(e => e.type === 'INITIAL')}
                      >
{Strings.viewInitialEvidence}
                      </Button>
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.finalParameter}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{execution.finalParameter || Strings.oplFormNotAssigned}</span>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleViewEvidence('FINAL')}
                        disabled={!execution.evidences || !execution.evidences.some(e => e.type === 'FINAL')}
                      >
{Strings.viewFinalEvidence}
                      </Button>
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={Strings.status}>
                    {execution.status === "A" ? Strings.active : Strings.resolved}
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
          
          <div className="mt-6">
            <div className="border border-gray-300 rounded">
              <div className="grid grid-cols-2">
                <div className="border-r border-gray-300">
                  <div className="p-3 flex justify-center">
                    <Button 
                      type="primary" 
                      className="w-4/5"
                      onClick={() => handleViewOpl(execution.referenceOplSopId, true)}
                      disabled={!execution.referenceOplSopId}
                    >
                      {Strings.ciltCardListReferenceOplLabel}
                    </Button>
                  </div>
                  <div className="p-3 flex justify-center border-t border-gray-300">
                    <Button 
                      type="primary" 
                      className="w-4/5"
                      onClick={() => handleViewOpl(execution.remediationOplSopId, false)}
                      disabled={!execution.remediationOplSopId}
                    >
                      {Strings.ciltCardListRemediationOplLabel}
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="p-3 flex justify-center">
                    <Button 
                      type="primary" 
                      className="w-4/5"
                      onClick={handleViewDiagram}
                    >
                      {Strings.seeDiagram}
                    </Button>
                  </div>
                  <div className="p-3 flex justify-center border-t border-gray-300">
                    <Button 
                      type="primary" 
                      className="w-4/5"
                      onClick={handleViewAmCard}
                      disabled={!execution.amTagId}
                    >
                      {Strings.amCard}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </Modal>
      
      {/* OPL Viewer Modals */}
      <OplViewerModal
        open={isReferenceOplModalVisible || isRemediationOplModalVisible}
        oplData={currentOplData}
        onClose={handleOplModalClose}
        title={oplModalTitle}
      />
      
      {/* AM Tag Viewer Modal */}
      <AMTagViewerModal
        open={isAmTagModalVisible}
        amTagId={execution?.amTagId || null}
        onClose={handleAmTagModalClose}
        title={Strings.amCard}
      />
      
      {/* Diagram Viewer Modal */}
      <DiagramViewerModal
        open={isDiagramModalVisible}
        ciltId={execution?.ciltId || null}
        onClose={handleDiagramModalClose}
        title={Strings.seeDiagram}
      />
      
      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        open={isEvidenceModalVisible}
        evidence={currentEvidence}
        onClose={handleEvidenceModalClose}
        title={evidenceModalTitle}
      />
    </>
  );
};

export default ExecutionDetailsModal;
