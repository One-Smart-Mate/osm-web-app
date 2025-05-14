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
  Tooltip,
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
// CiltLevelTreeModal import removed
import OplSelectionModal from "./OplSelectionModal";
import { formatSecondsToNaturalTime, parseNaturalTimeToSeconds } from "../../../utils/timeUtils";

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
  const [referenceOplModalVisible, setReferenceOplModalVisible] =
    useState(false);
  const [remediationOplModalVisible, setRemediationOplModalVisible] =
    useState(false);
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (visible && sequence?.siteId) {
      fetchCiltTypes();
      initializeForm();
      
      // Reference level ID code removed
    }
  }, [visible, sequence]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const initializeForm = () => {
    if (!sequence) return;
    
    // Initialize formatted time display
    if (sequence.standardTime) {
      setFormattedTime(formatSecondsToNaturalTime(sequence.standardTime));
    }

    // Level selection code removed

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

  // handleLevelSelect function removed

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

  // Get color from selected CILT type
  const getColorFromCiltType = (ciltTypeId: number | undefined): string => {
    if (!ciltTypeId) return "1890ff";
    
    const selectedType = ciltTypes.find(type => type.id === ciltTypeId);
    if (selectedType && selectedType.color) {
      // Remove # if it exists and return the color
      return selectedType.color.startsWith('#') ? 
        selectedType.color.substring(1) : 
        selectedType.color;
    }
    
    return "1890ff";
  };
  
  // Handle CILT type change to update the color
  const handleCiltTypeChange = (ciltTypeId: number) => {
    form.setFieldsValue({ secuenceColor: getColorFromCiltType(ciltTypeId) });
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
        undefined,
        undefined,
        values.order,
        values.secuenceList,
        getColorFromCiltType(values.ciltTypeId),
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
        destroyOnHidden
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
                {/* Level field removed */}
                <Form.Item
                  name="levelId"
                  hidden
                >
                  <Input type="hidden" />
                </Form.Item>
                <Form.Item
                  name="levelName"
                  hidden
                >
                  <Input type="hidden" />
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
                    onChange={handleCiltTypeChange}
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
                {/* Hidden Sequence Color - inherited from CILT type */}
                <Form.Item
                  name="secuenceColor"
                  hidden
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      {Strings.editCiltSequenceModalStandardTimeLabel}
                      {formattedTime && (
                        <Tooltip title="Time in HH:MM:SS format">
                          <span style={{ marginLeft: '8px', color: '#1890ff' }}>
                            ({formattedTime})
                          </span>
                        </Tooltip>
                      )}
                    </span>
                  }
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
                    onChange={(value) => {
                      if (value) {
                        setFormattedTime(formatSecondsToNaturalTime(Number(value)));
                      } else {
                        setFormattedTime('');
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value;
                      // Check if the input is in time format (contains ':')
                      if (inputValue && inputValue.includes(':')) {
                        const seconds = parseNaturalTimeToSeconds(inputValue);
                        if (seconds !== null) {
                          form.setFieldsValue({ standardTime: seconds });
                          setFormattedTime(formatSecondsToNaturalTime(seconds));
                        }
                      }
                    }}
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

      {/* Level Tree Modal removed */}

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
