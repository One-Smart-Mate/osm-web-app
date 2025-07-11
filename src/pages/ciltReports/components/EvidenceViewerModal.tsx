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
        <Image
          src={evidence.evidenceUrl}
          alt={`Evidence ${evidence.id}`}
          style={{ maxWidth: '100%', maxHeight: '500px' }}
          placeholder={
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Strings.loading || "Loading..."}
            </div>
          }
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxkRIaEbDMwnj4LnF+FRBBYSqQlsLTBFoEtA9tdA9nCdgKWL4BdZyQlXQDZQkJTk2U7Y//e6eme6ume7q+aHiNpp2u6XvWvvrn3fre++uqrr"
          onError={() => {
            // If image fails to load, show a fallback with open button
            console.log('Image failed to load, showing fallback');
          }}
        />
        
        <div className="mt-4">
          <Button 
            type="primary" 
            onClick={() => window.open(evidence.evidenceUrl, '_blank')}
            className="mr-2"
          >
            {Strings.openEvidence || "Abrir Evidencia"}
          </Button>
        </div>
        
        <div className="mt-4 text-left">
          <h4 className="font-semibold mb-2">{Strings.evidenceDetails}:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>ID:</strong> {evidence.id}</p>
            <p><strong>{Strings.type}:</strong> {
              evidence.type === 'INITIAL' ? Strings.initial :
              evidence.type === 'FINAL' ? Strings.final :
              evidence.type || 'N/A'
            }</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EvidenceViewerModal; 