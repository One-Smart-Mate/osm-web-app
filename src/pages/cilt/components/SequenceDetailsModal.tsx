import React from "react";
import { Modal, Card, Row, Col, Typography, Divider } from "antd";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import Strings from "../../../utils/localizations/Strings";
import { useGetCiltSequenceFrequenciesByCiltMutation } from "../../../services/cilt/ciltSequencesFrequenciesService";
import { CiltSequenceFrequency } from "../../../data/cilt/ciltSequencesFrequencies/ciltSequencesFrequencies";
import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";
import { formatSecondsToNaturalTime } from "../../../utils/timeUtils";

interface SequenceDetailsModalProps {
  visible: boolean;
  sequence: CiltSequence | null;
  onCancel: () => void;
  onViewOpl: (oplId: number | null) => void;
}

const { Text } = Typography;

const SequenceDetailsModal: React.FC<SequenceDetailsModalProps> = ({
  visible,
  sequence,
  onCancel,
}) => {
  if (!sequence) return null;

  // fetch all frequencies for this CILT master then filter by this sequence
  const [getSeqFreqs, { data: allSeqFreqs = [] }] = useGetCiltSequenceFrequenciesByCiltMutation();
  React.useEffect(() => {
    if (sequence.ciltMstrId) getSeqFreqs(String(sequence.ciltMstrId));
  }, [sequence.ciltMstrId]);
  const sequenceFreqs: CiltSequenceFrequency[] = (allSeqFreqs || []).filter(f => f.secuencyId === sequence.id);

  // fetch OPL master details
  const [getRefOpl, { data: referenceOpl }] = useGetOplMstrByIdMutation();
  const [getRemOpl, { data: remediationOpl }] = useGetOplMstrByIdMutation();
  React.useEffect(() => {
    if (sequence.referenceOplSop) getRefOpl(String(sequence.referenceOplSop));
  }, [sequence.referenceOplSop]);
  React.useEffect(() => {
    if (sequence.remediationOplSop) getRemOpl(String(sequence.remediationOplSop));
  }, [sequence.remediationOplSop]);

  return (
    <Modal
      title={`${Strings.detailsOf} ${Strings.sequence}`}
      open={visible}
      onCancel={onCancel}
      zIndex={1001}
      footer={null}
      width={700}
      style={{ top: 20 }}
    >
      <Card bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text type="secondary">{Strings.position}:</Text>
            <div>
              <Text strong>{sequence.positionName || "N/A"}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.ciltType}:</Text>
            <div>
              <Text strong>{sequence.ciltTypeName || "N/A"}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.standardTime}:</Text>
            <div>
              <Text strong>
                {sequence.standardTime
                  ? formatSecondsToNaturalTime(sequence.standardTime)
                  : "N/A"}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.color}:</Text>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor:
                    sequence.secuenceColor &&
                    sequence.secuenceColor.startsWith("#")
                      ? sequence.secuenceColor
                      : `#${sequence.secuenceColor || "f0f0f0"}`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  marginRight: "10px",
                  border: "1px solid #d9d9d9",
                }}
              />
              <Text>
                {sequence.secuenceColor &&
                sequence.secuenceColor.startsWith("#")
                  ? sequence.secuenceColor
                  : `#${sequence.secuenceColor || "N/A"}`}
              </Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">{Strings.requiredTools}:</Text>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <Text>{sequence.toolsRequired || "N/A"}</Text>
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">{Strings.stoppageReason}:</Text>
            <div>
              <Text>{sequence.stoppageReason ? Strings.yes : Strings.no}</Text>
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">{Strings.editCiltSequenceModalMachineStoppedLabel}:</Text>
            <div>
              <Text>{sequence.machineStopped ? Strings.yes : Strings.no}</Text>
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">{Strings.referencePoint}:</Text>
            <div>
              <Text>{sequence.referencePoint || "N/A"}</Text>
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">{Strings.selectableWithoutProgramming}:</Text>
            <div>
              <Text>{sequence.selectableWithoutProgramming ? Strings.yes : Strings.no}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.standardOk}:</Text>
            <div>
              <Text>{sequence.standardOk || "N/A"}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.quantityPicturesCreate}:</Text>
            <div>
              <Text>
                {sequence.quantityPicturesCreate || "0"}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.quantityPicturesClose}:</Text>
            <div>
              <Text>{sequence.quantityPicturesClose || "0"}</Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">{Strings.editCiltSequenceModalSequenceListLabel}:</Text>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <Text>{sequence.secuenceList || "N/A"}</Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">{Strings.createCiltSequenceModalFrequenciesTitle}:</Text>
            <div>
              <Text>{sequenceFreqs.length > 0 ? sequenceFreqs.map(f => f.frecuencyCode).join(", ") : "N/A"}</Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>{Strings.relatedOPLs}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">{Strings.referenceOPL}:</Text>
            <div>
              {sequence.referenceOplSop ? (
                <Text>{referenceOpl?.title || 'Loading...'}</Text>
              ) : (
                <Text>N/A</Text>
              )}
            </div>
          </Col>

          <Col span={12}>
            <Text type="secondary">{Strings.remediationOPL}:</Text>
            <div>
              {sequence.remediationOplSop ? (
                <Text>{remediationOpl?.title || 'Loading...'}</Text>
              ) : (
                <Text>N/A</Text>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

export default SequenceDetailsModal;
