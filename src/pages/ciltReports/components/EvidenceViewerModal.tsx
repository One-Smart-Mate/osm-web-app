import { Modal, Button, Image } from "antd";
import Strings from "../../../utils/localizations/Strings";

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

interface EvidenceViewerModalProps {
  open: boolean;
  evidence: Evidence | null;
  onClose: () => void;
  title: string;
}

/**
 * Modal component for displaying evidence (images, documents, etc.)
 */
export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  open,
  evidence,
  onClose,
  title,
}) => {
  if (!evidence) return null;

  // Determine if the evidence is an image based on URL extension
  const isImage = evidence.evidenceUrl && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(evidence.evidenceUrl);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} type="primary">
          {Strings.close}
        </Button>
      ]}
      width={800}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      style={{ top: 20 }}
    >
      <div className="text-center">
        {isImage ? (
          <Image
            src={evidence.evidenceUrl}
            alt={`Evidence ${evidence.id}`}
            style={{ maxWidth: '100%', maxHeight: '500px' }}
            placeholder={
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading...
              </div>
            }
          />
        ) : (
          <div className="p-4">
            <p className="mb-4">Evidence URL:</p>
            <a 
              href={evidence.evidenceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {evidence.evidenceUrl}
            </a>
            <div className="mt-4">
              <Button 
                type="primary" 
                onClick={() => window.open(evidence.evidenceUrl, '_blank')}
              >
{Strings.openEvidence}
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-left">
          <h4 className="font-semibold mb-2">{Strings.evidenceDetails}:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>ID:</strong> {evidence.id}</p>
            <p><strong>Type:</strong> {evidence.type || 'N/A'}</p>
            <p><strong>Created:</strong> {new Date(evidence.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EvidenceViewerModal; 