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
  Card,
  Tooltip,
} from "antd";
import { useLocation } from "react-router-dom";
import { useCreateCiltSequenceMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetCiltTypesBySiteMutation } from "../../../services/cilt/ciltTypesService";
import { useGetCiltFrequenciesAllMutation } from "../../../services/cilt/ciltFrequenciesService";
import { useCreateCiltSequenceFrequencyMutation } from "../../../services/cilt/ciltSequencesFrequenciesService";
import { useGetPositionsBySiteIdQuery } from "../../../services/positionService";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import { CiltFrequency } from "../../../data/cilt/ciltFrequencies/ciltFrequencies";
import { CreateCiltSequenceDTO } from "../../../data/cilt/ciltSequences/ciltSequences";
import { CreateCiltSequencesFrequenciesDTO } from "../../../data/cilt/ciltSequencesFrequencies/ciltSequencesFrequencies";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import Strings from "../../../utils/localizations/Strings";
// CiltLevelTreeModal import removed
import OplSelectionModal from "./OplSelectionModal";
import { formatSecondsToNaturalTime, parseNaturalTimeToSeconds } from "../../../utils/timeUtils";

const { TextArea } = Input;
const { Option } = Select;

interface CreateCiltSequenceModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateCiltSequenceModal: React.FC<CreateCiltSequenceModalProps> = ({
  visible,
  cilt,
  onCancel,
  onSuccess,
}) => {
  const location = useLocation();
  const [form] = Form.useForm();
  const [createCiltSequence] = useCreateCiltSequenceMutation();
  const [getCiltTypesBySite] = useGetCiltTypesBySiteMutation();
  const [getCiltFrequenciesAll] = useGetCiltFrequenciesAllMutation();
  const [createCiltSequenceFrequency] =
    useCreateCiltSequenceFrequencyMutation();
  const { data: positions } =
    useGetPositionsBySiteIdQuery(location.state?.siteId || "");

  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  const [ciltFrequencies, setCiltFrequencies] = useState<CiltFrequency[]>([]);
  const [loading, setLoading] = useState(false);
  const [referenceOplModalVisible, setReferenceOplModalVisible] =
    useState(false);
  const [remediationOplModalVisible, setRemediationOplModalVisible] =
    useState(false);
  const [selectedReferenceOpl, setSelectedReferenceOpl] =
    useState<OplMstr | null>(null);
  const [selectedRemediationOpl, setSelectedRemediationOpl] =
    useState<OplMstr | null>(null);
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (visible && location.state?.siteId) {
      fetchCiltTypes();
      fetchCiltFrequencies();
    }

    if (visible) {
      form.resetFields();
      setSelectedReferenceOpl(null);
      setSelectedRemediationOpl(null);
    }
  }, [visible, form, location.state]);

  useEffect(() => {
    if (cilt && visible) {
      form.setFieldsValue({
        positionId: cilt.positionId || null,
      });
      
      // Level ID code removed
    }
  }, [cilt, form, visible, positions]);

  const fetchCiltTypes = async () => {
    if (!location.state?.siteId) return;

    setLoading(true);
    try {
      const response = await getCiltTypesBySite(String(location.state.siteId)).unwrap();
      setCiltTypes(response || []);
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: Strings.createCiltSequenceModalErrorLoadingTypes,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCiltFrequencies = async () => {
    setLoading(true);
    try {
      const response = await getCiltFrequenciesAll().unwrap();
      setCiltFrequencies(response || []);
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: Strings.createCiltSequenceModalErrorLoadingFrequencies,
      });
    } finally {
      setLoading(false);
    }
  };

  // handleLevelSelect function removed

  const handleReferenceOplSelect = (opl: OplMstr) => {
    setSelectedReferenceOpl(opl);
    form.setFieldsValue({
      referenceOplSop: opl.id,
      referenceOplName: opl.title,
    });
  };

  const handleRemediationOplSelect = (opl: OplMstr) => {
    setSelectedRemediationOpl(opl);
    form.setFieldsValue({
      remediationOplSop: opl.id,
      remediationOplName: opl.title,
    });
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
    const typeColor = getColorFromCiltType(ciltTypeId);
    form.setFieldsValue({ secuenceColor: typeColor });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (!values.frequencies || values.frequencies.length === 0) {
        notification.error({
          message: "Error",
          description: "Por favor selecciona al menos una frecuencia.",
        });
        return;
      }

      console.log("positions data:", positions);
      console.log("CILT selected positionId:", cilt?.positionId);
      const selectedPosition = positions?.find(p => p.id === Number(cilt?.positionId));
      console.log("selectedPosition:", selectedPosition);
      console.log("CILT data:", cilt);
      const createPromises = values.frequencies.map(
        async (frequencyId: number) => {
          const combinedData = {
            ...values,
            siteId: Number(selectedPosition?.siteId || location.state?.siteId || 0),
            siteName: selectedPosition?.siteName || location.state?.siteName || "",
            areaId: Number(selectedPosition?.areaId || 0),
            areaName: selectedPosition?.areaName || "",
            positionId: Number(cilt?.positionId || 0),
            positionName: selectedPosition?.name || "",
            ciltMstrId: Number(cilt?.id || 0),
            ciltMstrName: cilt?.ciltName || "",
          };

          console.log("Combined data for sequence:", combinedData);

          const sequenceData: CreateCiltSequenceDTO = {
            siteId: Number(combinedData.siteId),
            siteName: combinedData.siteName,
            areaId: Number(combinedData.areaId),
            areaName: combinedData.areaName,
            positionId: Number(combinedData.positionId),
            positionName: combinedData.positionName,
            ciltMstrId: Number(combinedData.ciltMstrId),
            ciltMstrName: combinedData.ciltMstrName,
            levelId: undefined,
            levelName: undefined,
            order: combinedData.order || 1,
            secuenceList: combinedData.secuenceList,
            secuenceColor: getColorFromCiltType(combinedData.ciltTypeId),
            ciltTypeId: combinedData.ciltTypeId,
            ciltTypeName:
              ciltTypes.find((type) => type.id === combinedData.ciltTypeId)
                ?.name || "",
            referenceOplSop: selectedReferenceOpl?.id,
            standardTime: combinedData.standardTime,
            standardOk: combinedData.standardOk,
            remediationOplSop: selectedRemediationOpl?.id,
            toolsRequired: combinedData.toolsRequired,
            stoppageReason: combinedData.stoppageReason ? 1 : 0,
            quantityPicturesCreate: combinedData.quantityPicturesCreate,
            quantityPicturesClose: combinedData.quantityPicturesClose,
            createdAt: new Date().toISOString(),
          };

          console.log("Creating sequence with data:", JSON.stringify(sequenceData, null, 2));

          const response = await createCiltSequence(sequenceData).unwrap();
          console.log("Sequence creation response:", response);

          if (response && response.id) {
            const frequency = ciltFrequencies.find((f) => f.id === frequencyId);

            const sequenceFrequencyData: CreateCiltSequencesFrequenciesDTO = {
              siteId: Number(combinedData.siteId),
              positionId: Number(combinedData.positionId),
              ciltId: Number(combinedData.ciltMstrId),
              secuencyId: response.id,
              frecuencyId: frequencyId,
              frecuencyCode: frequency?.frecuencyCode || "",
              status: "A",
            };

            console.log("Creating sequence frequency with data:", JSON.stringify(sequenceFrequencyData, null, 2));
            await createCiltSequenceFrequency(sequenceFrequencyData).unwrap();
          }

          return response;
        }
      );

      await Promise.all(createPromises);

      notification.success({
        message: Strings.createCiltSequenceModalSuccess,
        description: Strings.createCiltSequenceModalSuccessDescription,
      });

      // Reset form and selections after successful submit
      form.resetFields();
      setSelectedReferenceOpl(null);
      setSelectedRemediationOpl(null);
      setFormattedTime('');

      // Notificar al componente padre para que actualice los datos
      // Este es el punto clave para asegurar que la tabla se actualice
      onSuccess();
      
      // Cerrar el modal después de un breve retraso para asegurar que se completen todas las operaciones
      setTimeout(() => {
        onCancel();
      }, 100);
    } catch (error) {
      console.error("Error creating CILT sequences:", error);
      notification.error({
        message: Strings.createCiltSequenceModalError,
        description: Strings.createCiltSequenceModalErrorDescription,
      });
    } finally {
      setLoading(false);
    }
  };

  // Custom cancel handler: reset form and states
  const handleCancel = () => {
    form.resetFields();
    setSelectedReferenceOpl(null);
    setSelectedRemediationOpl(null);
    onCancel();
  };

  return (
    <Modal
      title={Strings.createCiltSequenceModalTitle}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            stoppageReason: false,
            quantityPicturesCreate: 0,
            quantityPicturesClose: 0,
            positionId: cilt?.positionId,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                title={
                  <div
                    style={{
                      color: "#1890ff",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {Strings.createCiltSequenceModalBasicInfoTitle}
                  </div>
                }
                bordered={true}
                style={{ height: "100%" }}
              >
                {/* CILT Type */}
                <Form.Item
                  name="ciltTypeId"
                  label={Strings.editCiltSequenceModalCiltTypeLabel}
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
                    loading={loading}
                    disabled={loading}
                    onChange={handleCiltTypeChange}
                  >
                    {ciltTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Level field removed */}

                {/* Frequencies */}
                <Form.Item
                  name="frequencies"
                  label={Strings.createCiltSequenceModalFrequenciesTitle}
                  help={Strings.createCiltSequenceModalFrequenciesDescription}
                  rules={[
                    {
                      required: true,
                      message:
                        Strings.createCiltSequenceModalFrequenciesRequired,
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder={
                      Strings.createCiltSequenceModalFrequenciesRequired
                    }
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const childText = option?.label?.toString() || "";
                      return (
                        childText.toLowerCase().indexOf(input.toLowerCase()) >=
                        0
                      );
                    }}
                    style={{ width: "100%" }}
                    options={ciltFrequencies.map((frequency) => ({
                      value: frequency.id,
                      label: `${frequency.frecuencyCode} - ${frequency.description}`,
                    }))}
                  />
                </Form.Item>

                {/* Hidden Order field */}
                <Form.Item name="order" hidden>
                  <Input type="number" />
                </Form.Item>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                title={
                  <div
                    style={{
                      color: "#1890ff",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {Strings.createCiltSequenceModalDetailsTitle}
                  </div>
                }
                bordered={true}
                style={{ height: "100%" }}
              >
                {/* Reference OPL/SOP */}
                <Form.Item
                  name="referenceOplSop"
                  label={Strings.editCiltSequenceModalReferenceOplLabel}
                >
                  <div className="flex items-center">
                    <Button
                      type="primary"
                      onClick={() => setReferenceOplModalVisible(true)}
                      className="mr-2"
                    >
                      {Strings.oplSelectionModalSelectButton}
                    </Button>
                    {selectedReferenceOpl && (
                      <div className="border rounded p-2 flex-1">
                        {selectedReferenceOpl.title}
                      </div>
                    )}
                    <Input type="hidden" value={selectedReferenceOpl?.id} />
                  </div>
                </Form.Item>

                {/* Remediation OPL/SOP */}
                <Form.Item
                  name="remediationOplSop"
                  label={Strings.editCiltSequenceModalRemediationOplLabel}
                >
                  <div className="flex items-center">
                    <Button
                      type="primary"
                      onClick={() => setRemediationOplModalVisible(true)}
                      className="mr-2"
                    >
                      {Strings.oplSelectionModalSelectButton}
                    </Button>
                    {selectedRemediationOpl && (
                      <div className="border rounded p-2 flex-1">
                        {selectedRemediationOpl.title}
                      </div>
                    )}
                    <Input type="hidden" value={selectedRemediationOpl?.id} />
                  </div>
                </Form.Item>

                {/* Sequence List */}
                <Form.Item
                  name="secuenceList"
                  label={Strings.editCiltSequenceModalSequenceListLabel}
                  rules={[
                    {
                      required: true,
                      message:
                        Strings.editCiltSequenceModalSequenceListRequired,
                    },
                  ]}
                >
                  <TextArea
                    placeholder={
                      Strings.editCiltSequenceModalSequenceListPlaceholder
                    }
                    autoSize={{ minRows: 4, maxRows: 8 }}
                  />
                </Form.Item>

                {/* Hidden Sequence Color - inherited from CILT type */}
                <Form.Item
                  name="secuenceColor"
                  hidden
                >
                  <Input />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              {/* Position */}
              <Form.Item hidden name="positionId">
                <Input />
              </Form.Item>

              {/* Standard Time */}
              <Form.Item
                name="standardTime"
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
                rules={[
                  {
                    required: true,
                    message: Strings.editCiltSequenceModalStandardTimeRequired,
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%', height: '40px' }}
                  placeholder={Strings.editCiltSequenceModalStandardTimePlaceholder}
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

              {/* Standard OK */}
              <Form.Item
                name="standardOk"
                label={Strings.editCiltSequenceModalStandardOkLabel}
                rules={[
                  {
                    required: true,
                    message: Strings.editCiltSequenceModalStandardOkRequired,
                  },
                ]}
              >
                <Input
                  placeholder={Strings.editCiltSequenceModalStandardOkPlaceholder}
                />
              </Form.Item>

              {/* Stoppage Reason */}
              <Form.Item
                name="stoppageReason"
                label={Strings.editCiltSequenceModalStoppageReasonLabel}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* Quantity Pictures Create */}
              <Form.Item
                name="quantityPicturesCreate"
                label={Strings.editCiltSequenceModalQuantityPicturesCreateLabel}
                rules={[
                  {
                    required: true,
                    message:
                      Strings.editCiltSequenceModalQuantityPicturesCreateRequired,
                  },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>

              {/* Quantity Pictures Close */}
              <Form.Item
                name="quantityPicturesClose"
                label={Strings.editCiltSequenceModalQuantityPicturesCloseLabel}
                rules={[
                  {
                    required: true,
                    message:
                      Strings.editCiltSequenceModalQuantityPicturesCloseRequired,
                  },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              {/* Tools Required */}
              <Form.Item
                name="toolsRequired"
                label={Strings.editCiltSequenceModalToolsRequiredLabel}
                getValueFromEvent={e => e.target.value}
              >
                <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={handleCancel}>{Strings.cancel}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {Strings.save}
            </Button>
          </div>
        </Form>
      </Spin>

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
    </Modal>
  );
};

export default CreateCiltSequenceModal;
