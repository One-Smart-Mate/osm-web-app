import React from "react";
import { Modal, Card, Row, Col, Typography, Divider } from "antd";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import Strings from "../../../utils/localizations/Strings";

import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";
import { formatSecondsToNaturalTime } from "../../../utils/timeUtils";

interface SequenceDetailsModalProps {
  visible: boolean;
  sequence: CiltSequence | null;
  onCancel: () => void;
  onViewOpl: (_oplId: number | null) => void;
}

const { Text } = Typography;

const SequenceDetailsModal: React.FC<SequenceDetailsModalProps> = ({
  visible,
  sequence,
  onCancel,
}) => {
  if (!sequence) return null;

  // Debug to check if specialWarning exists in the sequence object
  console.log("Sequence object in details:", sequence);

  const [getRefOpl, { data: referenceOpl }] = useGetOplMstrByIdMutation();
  const [getRemOpl, { data: remediationOpl }] = useGetOplMstrByIdMutation();
  React.useEffect(() => {
    if (sequence.referenceOplSopId)
      getRefOpl(String(sequence.referenceOplSopId));
  }, [sequence.referenceOplSopId]);
  React.useEffect(() => {
    if (sequence.remediationOplSopId)
      getRemOpl(String(sequence.remediationOplSopId));
  }, [sequence.remediationOplSopId]);

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
            <div style={{ whiteSpace: "pre-wrap" }}>
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
            <Text type="secondary">
              {Strings.editCiltSequenceModalMachineStoppedLabel}:
            </Text>
            <div>
              <Text>{sequence.machineStopped ? Strings.yes : Strings.no}</Text>
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">{Strings.referencePoint}:</Text>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <Text>{sequence.referencePoint || "N/A"}</Text>
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">
              {Strings.selectableWithoutProgramming}:
            </Text>
            <div>
              <Text>
                {sequence.selectableWithoutProgramming
                  ? Strings.yes
                  : Strings.no}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.standardOk}:</Text>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <Text>{sequence.standardOk || "N/A"}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.quantityPicturesCreate}:</Text>
            <div>
              <Text>{sequence.quantityPicturesCreate || "0"}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.quantityPicturesClose}:</Text>
            <div>
              <Text>{sequence.quantityPicturesClose || "0"}</Text>
            </div>
          </Col>
          <Col span={24}>
            <Text type="secondary">{Strings.specialWarning}:</Text>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <Text>
                {sequence.specialWarning || Strings.oplFormNotAssigned}
              </Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">
              {Strings.editCiltSequenceModalSequenceListLabel}:
            </Text>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <Text>{sequence.secuenceList || "N/A"}</Text>
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
              {sequence.referenceOplSopId ? (
                <Text>{referenceOpl?.title || "Loading..."}</Text>
              ) : (
                <Text>N/A</Text>
              )}
            </div>
          </Col>

          <Col span={12}>
            <Text type="secondary">{Strings.remediationOPL}:</Text>
            <div>
              {sequence.remediationOplSopId ? (
                <Text>{remediationOpl?.title || "Loading..."}</Text>
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
