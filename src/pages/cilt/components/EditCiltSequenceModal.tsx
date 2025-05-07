import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Switch,
  Spin,
  notification,
  Row,
  Col,
  ColorPicker,
} from "antd";
import { useUpdateCiltSequenceMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetCiltTypesBySiteMutation } from "../../../services/cilt/ciltTypesService";
import {
  CiltSequence,
  UpdateCiltSequenceDTO,
} from "../../../data/cilt/ciltSequences/ciltSequences";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import Strings from "../../../utils/localizations/Strings";
import CiltLevelTreeModal from "./CiltLevelTreeModal";
import OplSelectionModal from "./OplSelectionModal";

const { TextArea } = Input;
const { Option } = Select;

interface EditCiltSequenceModalProps {
  visible: boolean;
  sequence: CiltSequence | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditCiltSequenceModal: React.FC<EditCiltSequenceModalProps> = ({
  visible,
  sequence,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [updateCiltSequence] = useUpdateCiltSequenceMutation();
  const [getCiltTypesBySite] = useGetCiltTypesBySiteMutation();

  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  const [loading, setLoading] = useState(false);
  const [levelTreeModalVisible, setLevelTreeModalVisible] = useState(false);
  const [referenceOplModalVisible, setReferenceOplModalVisible] =
    useState(false);
  const [remediationOplModalVisible, setRemediationOplModalVisible] =
    useState(false);
  const [selectedLevel, setSelectedLevel] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [color, setColor] = useState<string>("#1677FF");

  useEffect(() => {
    if (visible && sequence?.siteId) {
      fetchCiltTypes();

      initializeForm();
    }
  }, [visible, sequence]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedLevel(null);
    }
  }, [visible, form]);

  const initializeForm = () => {
    if (!sequence) return;

    if (sequence.secuenceColor) {
      const colorValue = sequence.secuenceColor.startsWith("#")
        ? sequence.secuenceColor
        : `#${sequence.secuenceColor}`;
      setColor(colorValue);
    }

    if (sequence.levelId && sequence.levelName) {
      setSelectedLevel({
        id: sequence.levelId,
        name: sequence.levelName,
      });
    }

    form.setFieldsValue({
      id: sequence.id,
      siteId: sequence.siteId,
      siteName: sequence.siteName,
      areaId: sequence.areaId,
      areaName: sequence.areaName,
      positionId: sequence.positionId,
      positionName: sequence.positionName,
      ciltMstrId: sequence.ciltMstrId,
      ciltMstrName: sequence.ciltMstrName,
      levelId: sequence.levelId,
      levelName: sequence.levelName,
      order: sequence.order,
      secuenceList: sequence.secuenceList,
      secuenceColor: sequence.secuenceColor?.replace("#", ""),
      ciltTypeId: sequence.ciltTypeId,
      ciltTypeName: sequence.ciltTypeName,
      referenceOplSop: sequence.referenceOplSop,
      referenceOplName: "OPL de Referencia",
      remediationOplSop: sequence.remediationOplSop,
      remediationOplName: "OPL de Remediación",
      standardTime: sequence.standardTime,
      standardOk: sequence.standardOk,
      toolsRequired: sequence.toolsRequired,
      stoppageReason: sequence.stoppageReason === 1,
      quantityPicturesCreate: sequence.quantityPicturesCreate,
      quantityPicturesClose: sequence.quantityPicturesClose,
    });
  };

  const fetchCiltTypes = async () => {
    if (!sequence?.siteId) return;

    setLoading(true);
    try {
      const response = await getCiltTypesBySite(
        String(sequence.siteId)
      ).unwrap();
      setCiltTypes(response || []);
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: Strings.editCiltSequenceModalErrorLoadingTypes,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelect = (levelData: any) => {
    if (levelData) {
      setSelectedLevel({
        id: Number(levelData.id),
        name: levelData.name,
      });

      form.setFieldsValue({
        levelId: Number(levelData.id),
        levelName: levelData.name,
      });
    }
    setLevelTreeModalVisible(false);
  };

  const handleReferenceOplSelect = (opl: OplMstr) => {
    form.setFieldsValue({
      referenceOplSop: opl.id,
      referenceOplName: opl.title,
    });
    setReferenceOplModalVisible(false);
  };

  const handleRemediationOplSelect = (opl: OplMstr) => {
    form.setFieldsValue({
      remediationOplSop: opl.id,
      remediationOplName: opl.title,
    });
    setRemediationOplModalVisible(false);
  };

  const getSelectedColor = (color: string | undefined): string => {
    return color || "#1890ff";
  };

  const handleColorChange = (colorValue: any) => {
    const hexColor = colorValue.toHex().replace("#", "");
    setColor("#" + hexColor);
    form.setFieldsValue({ secuenceColor: hexColor });
  };

  const handleSubmit = async (values: any) => {
    if (!sequence) return;

    try {
      setLoading(true);

      const sequenceData: UpdateCiltSequenceDTO = new UpdateCiltSequenceDTO(
        values.id,
        new Date().toISOString(),
        values.siteId,
        values.siteName || sequence.siteName || "",
        values.areaId,
        values.areaName || sequence.areaName || "",
        values.positionId,
        values.positionName || sequence.positionName || "",
        values.ciltMstrId,
        values.ciltMstrName || sequence.ciltMstrName || "",
        values.levelId,
        selectedLevel?.name || values.levelName || "",
        values.order,
        values.secuenceList,
        values.secuenceColor || getSelectedColor(color).replace("#", ""),
        values.ciltTypeId,
        ciltTypes.find((type) => type.id === values.ciltTypeId)?.name ||
          values.ciltTypeName,
        values.referenceOplSop,
        values.standardTime,
        values.standardOk,
        values.remediationOplSop,
        values.toolsRequired,
        values.stoppageReason ? 1 : 0,
        values.quantityPicturesCreate,
        values.quantityPicturesClose
      );

      await updateCiltSequence(sequenceData).unwrap();

      notification.success({
        message: Strings.editCiltSequenceModalSuccess,
        description: Strings.editCiltSequenceModalSuccessDescription,
      });

      onSuccess();
    } catch (error) {
      console.error("Error al actualizar la secuencia:", error);
      notification.error({
        message: Strings.editCiltSequenceModalError,
        description: Strings.editCiltSequenceModalErrorDescription,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={Strings.editCiltSequenceModalTitle}
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              stoppageReason: false,
              order: 1,
              quantityPicturesCreate: 0,
              quantityPicturesClose: 0,
            }}
          >
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="siteId" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="siteName" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="areaId" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="areaName" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="positionId" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="ciltMstrId" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="ciltMstrName" hidden>
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalPositionLabel}
                  name="positionName"
                  rules={[
                    {
                      required: true,
                      message: Strings.editCiltSequenceModalLevelRequired,
                    },
                  ]}
                >
                  <Input
                    placeholder={
                      Strings.editCiltSequenceModalPositionPlaceholder
                    }
                    disabled
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalLevelLabel}
                  required
                >
                  <div className="flex items-center">
                    <Form.Item
                      name="levelId"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: Strings.editCiltSequenceModalLevelRequired,
                        },
                      ]}
                    >
                      <Input type="hidden" />
                    </Form.Item>
                    <Form.Item
                      name="levelName"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: Strings.editCiltSequenceModalLevelRequired,
                        },
                      ]}
                    >
                      <Input type="hidden" />
                    </Form.Item>
                    
                    <Button
                      type="primary"
                      onClick={() => setLevelTreeModalVisible(true)}
                      className="mr-2"
                    >
                      {Strings.select} {Strings.level}
                    </Button>
                    {(selectedLevel || form.getFieldValue('levelName')) && (
                      <div className="border rounded p-2 flex-1">
                        {selectedLevel ? selectedLevel.name : form.getFieldValue('levelName')}
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalCiltTypeLabel}
                  name="ciltTypeId"
                  rules={[
                    {
                      required: true,
                      message: Strings.editCiltSequenceModalCiltTypeRequired,
                    },
                  ]}
                >
                  <Select
                    placeholder={
                      Strings.editCiltSequenceModalCiltTypePlaceholder
                    }
                  >
                    {ciltTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalOrderLabel}
                  name="order"
                  rules={[
                    {
                      required: true,
                      message: Strings.editCiltSequenceModalOrderRequired,
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    placeholder={Strings.editCiltSequenceModalOrderPlaceholder}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalColorLabel}
                  name="secuenceColor"
                >
                  <Input
                    addonBefore={
                      <ColorPicker value={color} onChange={handleColorChange} />
                    }
                    placeholder={Strings.editCiltSequenceModalColorPlaceholder}
                    value={color.replace("#", "")}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalStandardTimeLabel}
                  name="standardTime"
                  rules={[
                    {
                      required: true,
                      message:
                        Strings.editCiltSequenceModalStandardTimeRequired,
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder={
                      Strings.editCiltSequenceModalStandardTimePlaceholder
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={Strings.editCiltSequenceModalSequenceListLabel}
              name="secuenceList"
              rules={[
                {
                  required: true,
                  message: Strings.editCiltSequenceModalSequenceListRequired,
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={
                  Strings.editCiltSequenceModalSequenceListPlaceholder
                }
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalReferenceOplLabel}
                >
                  <div className="flex items-center">
                    <Form.Item name="referenceOplSop" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                    <Form.Item name="referenceOplName" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                    
                    <Button
                      type="primary"
                      onClick={() => setReferenceOplModalVisible(true)}
                      className="mr-2"
                    >
                      {Strings.select} OPL
                    </Button>
                    {form.getFieldValue('referenceOplName') && (
                      <div className="border rounded p-2 flex-1">
                        {form.getFieldValue('referenceOplName')}
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalRemediationOplLabel}
                >
                  <div className="flex items-center">
                    <Form.Item name="remediationOplSop" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                    <Form.Item name="remediationOplName" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                    
                    <Button
                      type="primary"
                      onClick={() => setRemediationOplModalVisible(true)}
                      className="mr-2"
                    >
                      {Strings.select} OPL
                    </Button>
                    {form.getFieldValue('remediationOplName') && (
                      <div className="border rounded p-2 flex-1">
                        {form.getFieldValue('remediationOplName')}
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={Strings.editCiltSequenceModalToolsRequiredLabel}
              name="toolsRequired"
            >
              <TextArea
                rows={2}
                placeholder={
                  Strings.editCiltSequenceModalToolsRequiredPlaceholder
                }
              />
            </Form.Item>

            <Form.Item
              label={Strings.editCiltSequenceModalStandardOkLabel}
              name="standardOk"
            >
              <TextArea
                rows={2}
                placeholder={Strings.editCiltSequenceModalStandardOkPlaceholder}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={Strings.editCiltSequenceModalStoppageReasonLabel}
                  name="stoppageReason"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={
                    Strings.editCiltSequenceModalQuantityPicturesCreateLabel
                  }
                  name="quantityPicturesCreate"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={
                    Strings.editCiltSequenceModalQuantityPicturesCloseLabel
                  }
                  name="quantityPicturesClose"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" gutter={16}>
              <Col>
                <Button onClick={onCancel}>{Strings.cancel}</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {Strings.save}
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>

      {/* Level Tree Modal */}
      {sequence && sequence.siteId && (
        <CiltLevelTreeModal
          isVisible={levelTreeModalVisible}
          onClose={() => setLevelTreeModalVisible(false)}
          siteId={sequence.siteId.toString()}
          siteName={sequence.siteName || ""}
          onSelectLevel={handleLevelSelect}
        />
      )}

      {/* OPL Selection Modals */}
      <OplSelectionModal
        isVisible={referenceOplModalVisible}
        onClose={() => setReferenceOplModalVisible(false)}
        onSelect={handleReferenceOplSelect}
      />

      <OplSelectionModal
        isVisible={remediationOplModalVisible}
        onClose={() => setRemediationOplModalVisible(false)}
        onSelect={handleRemediationOplSelect}
      />
    </>
  );
};

export default EditCiltSequenceModal;
