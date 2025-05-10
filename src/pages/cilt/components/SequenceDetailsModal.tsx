import React from "react";
import { Modal, Card, Row, Col, Typography, Divider, Button } from "antd";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import Strings from "../../../utils/localizations/Strings";

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
  onViewOpl,
}) => {
  if (!sequence) return null;

  return (
    <Modal
      title={`${Strings.detailsOf} ${Strings.sequence}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
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
                  ? `${sequence.standardTime} ${Strings.seconds}` 
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
            <div>
              <Text>{sequence.toolsRequired || "N/A"}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">{Strings.stoppageReason}:</Text>
            <div>
              <Text>{sequence.stoppageReason ? Strings.yes : Strings.no}</Text>
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
            <Text strong>{Strings.relatedOPLs}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">{Strings.referenceOPL}:</Text>
            <div>
              {sequence.referenceOplSop ? (
                <Button
                  type="link"
                  onClick={() =>
                    onViewOpl(sequence.referenceOplSop)
                  }
                >
                  {Strings.viewReferenceOPL}
                </Button>
              ) : (
                <Text>N/A</Text>
              )}
            </div>
          </Col>

          <Col span={12}>
            <Text type="secondary">{Strings.remediationOPL}:</Text>
            <div>
              {sequence.remediationOplSop ? (
                <Button
                  type="link"
                  onClick={() =>
                    onViewOpl(sequence.remediationOplSop)
                  }
                >
                  {Strings.viewRemediationOPL}
                </Button>
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
