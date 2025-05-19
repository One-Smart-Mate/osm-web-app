import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { SearchOutlined } from "@ant-design/icons";
import { useUpdateCiltSequenceMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetCiltTypesBySiteMutation } from "../../../services/cilt/ciltTypesService";
import {
  CiltSequence,
} from "../../../data/cilt/ciltSequences/ciltSequences";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import Strings from "../../../utils/localizations/Strings";

import OplSelectionModal from "./OplSelectionModal";
import { formatSecondsToNaturalTime, parseNaturalTimeToSeconds } from "../../../utils/timeUtils";
import Constants from "../../../utils/Constants";
import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";

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
  const [getOplMstrById] = useGetOplMstrByIdMutation();

  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  const [loading, setLoading] = useState(false);
  const [referenceOplModalVisible, setReferenceOplModalVisible] =
    useState(false);
  const [remediationOplModalVisible, setRemediationOplModalVisible] =
    useState(false);
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [referenceOplName, setReferenceOplName] = useState<string>('');
  const [remediationOplName, setRemediationOplName] = useState<string>('');

  useEffect(() => {
    if (visible && sequence?.siteId) {
      
      getCiltTypesBySite(sequence.siteId.toString())
        .unwrap()
        .then((types) => {
          setCiltTypes(types);
        })
        .catch((error) => {
          console.error('Error fetching CILT types:', error);
        });

      
      const loadFormData = async () => {
        if (!sequence) return;
    
        
        if (sequence.standardTime) {
          setFormattedTime(formatSecondsToNaturalTime(sequence.standardTime));
        }

        
        if (sequence.referenceOplSop) {
          try {
            const referenceOpl = await getOplMstrById(String(sequence.referenceOplSop)).unwrap();
            setReferenceOplName(referenceOpl.title || '');
            form.setFieldsValue({ referenceOplName: referenceOpl.title });
          } catch (error) {
            console.error('Error al cargar el OPL de referencia:', error);
          }
        }

        if (sequence.remediationOplSop) {
          try {
            const remediationOpl = await getOplMstrById(String(sequence.remediationOplSop)).unwrap();
            setRemediationOplName(remediationOpl.title || '');
            form.setFieldsValue({ remediationOplName: remediationOpl.title });
          } catch (error) {
            console.error('Error al cargar el OPL de remediación:', error);
          }
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
          remediationOplSop: sequence.remediationOplSop,
          standardTime: sequence.standardTime,
          standardOk: sequence.standardOk,
          toolsRequired: sequence.toolsRequired,
          stoppageReason: sequence.stoppageReason === 1,
          machineStopped: sequence.machineStopped === 1,
          status: sequence.status,
          quantityPicturesCreate: sequence.quantityPicturesCreate,
          quantityPicturesClose: sequence.quantityPicturesClose,
          referencePoint: sequence.referencePoint,
          selectableWithoutProgramming: sequence.selectableWithoutProgramming === 1,
        });
      };

      loadFormData();
    }
    
    
    if (!visible) {
      setReferenceOplName('');
      setRemediationOplName('');
    }
  }, [visible, sequence, form, getCiltTypesBySite, getOplMstrById]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  

  const handleReferenceOplSelect = (opl: OplMstr) => {
    try {
      // Actualizar tanto el estado como el formulario
      setReferenceOplName(opl.title || '');
      
      // Actualizar los campos del formulario
      form.setFieldsValue({
        referenceOplSop: opl.id,
        referenceOplName: opl.title,
      });
      
      // Cerrar el modal después de una pequeña pausa para asegurar que los datos se guarden
      setTimeout(() => {
        setReferenceOplModalVisible(false);
      }, 100);
    } catch (error) {
      console.error('Error al seleccionar OPL de referencia:', error);
    }
  };

  const handleRemediationOplSelect = (opl: OplMstr) => {
    try {
      // Actualizar tanto el estado como el formulario
      setRemediationOplName(opl.title || '');
      
      // Actualizar los campos del formulario
      form.setFieldsValue({
        remediationOplSop: opl.id,
        remediationOplName: opl.title,
      });
      
      // Cerrar el modal después de una pequeña pausa para asegurar que los datos se guarden
      setTimeout(() => {
        setRemediationOplModalVisible(false);
      }, 100);
    } catch (error) {
      console.error('Error al seleccionar OPL de remediación:', error);
    }
  };

  
  const getColorFromCiltType = (ciltTypeId: number | undefined): string => {
    if (!ciltTypeId) return "1890ff";
    
    const selectedType = ciltTypes.find(type => type.id === ciltTypeId);
    if (selectedType && selectedType.color) {
      
      return selectedType.color.startsWith('#') ? 
        selectedType.color.substring(1) : 
        selectedType.color;
    }
    
    return "1890ff";
  };
  
  
  const handleCiltTypeChange = (ciltTypeId: number) => {
    form.setFieldsValue({ secuenceColor: getColorFromCiltType(ciltTypeId) });
  };

  const handleSubmit = async (values: any) => {
    if (!sequence) return;

    try {
      setLoading(true);
      
      
      values.positionId = sequence.positionId;
      values.positionName = sequence.positionName;
      values.order = sequence.order;

      
      const payload = {
        id: values.id,
        siteId: Number(values.siteId),
        siteName: values.siteName || sequence.siteName || "string",
        areaId: Number(values.areaId),
        areaName: values.areaName || sequence.areaName || "string",
        positionId: Number(values.positionId),
        positionName: values.positionName || sequence.positionName || "string",
        ciltMstrId: Number(values.ciltMstrId),
        ciltMstrName: values.ciltMstrName || sequence.ciltMstrName || "string",
        levelId: Number(values.levelId),
        levelName: values.levelName || "string",
        route: values.route || "string",
        order: Number(values.order),
        secuenceList: values.secuenceList || "string",
        secuenceColor: getColorFromCiltType(values.ciltTypeId),
        ciltTypeId: Number(values.ciltTypeId),
        ciltTypeName: ciltTypes.find((type) => type.id === values.ciltTypeId)?.name || values.ciltTypeName || "string",
        referenceOplSop: Number(values.referenceOplSop) || 0,
        standardTime: Number(values.standardTime) || 0,
        standardOk: values.standardOk || "string",
        remediationOplSop: Number(values.remediationOplSop) || 0,
        toolsRequired: values.toolsRequired || "string",
        stoppageReason: values.stoppageReason ? 1 : 0,
        machineStopped: values.machineStopped ? 1 : 0,
        quantityPicturesCreate: Number(values.quantityPicturesCreate) || 0,
        quantityPicturesClose: Number(values.quantityPicturesClose) || 0,
        referencePoint: values.referencePoint || "",
        selectableWithoutProgramming: values.selectableWithoutProgramming ? 1 : 0,
        status: values.status || "A",
        updatedAt: new Date().toISOString()
      };
      
      delete (values as any).referenceOplName;
      delete (values as any).remediationOplName;

      await updateCiltSequence(payload).unwrap();

      notification.success({
        message: Strings.editCiltSequenceModalSuccess,
        description: Strings.editCiltSequenceModalSuccessDescription,
      });

      onSuccess();
    } catch (error) {
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
        width={1000}
        destroyOnClose={true}
        maskClosable={false}
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

            
            <div style={{ display: 'none' }}>
              <Form.Item name="siteId" hidden><Input /></Form.Item>
              <Form.Item name="siteName" hidden><Input /></Form.Item>
              <Form.Item name="areaId" hidden><Input /></Form.Item>
              <Form.Item name="areaName" hidden><Input /></Form.Item>
              <Form.Item name="positionId" hidden><Input /></Form.Item>
              <Form.Item name="positionName" hidden><Input /></Form.Item>
              <Form.Item name="ciltMstrId" hidden><Input /></Form.Item>
              <Form.Item name="ciltMstrName" hidden><Input /></Form.Item>
              <Form.Item name="levelId" hidden><Input /></Form.Item>
              <Form.Item name="levelName" hidden><Input /></Form.Item>
              <Form.Item name="order" hidden><Input /></Form.Item>
              <Form.Item name="secuenceColor" hidden><Input /></Form.Item>
            </div>

            <div className="mb-4">
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
                  className="w-full"
                >
                  {ciltTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Row gutter={16}>

              <Col span={12}>
                <Form.Item
                  label={
                    <div className="flex items-center">
                      <span>{Strings.editCiltSequenceModalStandardTimeLabel}</span>
                      {formattedTime && (
                        <Tooltip title="Time in HH:MM:SS format">
                          <span className="ml-2 text-primary">
                            ({formattedTime})
                          </span>
                        </Tooltip>
                      )}
                    </div>
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
                  <div className="relative">
                    <InputNumber
                      min={1}
                      className="w-full"
                      placeholder={
                        Strings.editCiltSequenceModalStandardTimePlaceholder
                      }
                      onChange={(value) => {
                        if (value) {
                          setFormattedTime(formatSecondsToNaturalTime(Number(value)));
                        } else {
                          setFormattedTime("");
                        }
                      }}
                      onBlur={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue && inputValue.includes(":")) {
                          const seconds = parseNaturalTimeToSeconds(inputValue);
                          if (seconds !== null) {
                            form.setFieldsValue({ standardTime: seconds });
                            setFormattedTime(formatSecondsToNaturalTime(seconds));
                          }
                        }
                      }}
                      
                      value={form.getFieldValue('standardTime')}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <small>sec</small>
                    </div>
                  </div>
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
                  <Form.Item name="referenceOplSop" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Input.Group compact>
                    <Form.Item
                      name="referenceOplName"
                      noStyle
                    >
                      <Input
                        style={{ width: 'calc(100% - 32px)' }}
                        readOnly
                        placeholder={Strings.editCiltSequenceModalReferenceOplLabel}
                        value={referenceOplName} 
                        onChange={(e) => setReferenceOplName(e.target.value)}
                      />
                    </Form.Item>
                    <Button
                      icon={<SearchOutlined />}
                      onClick={() => setReferenceOplModalVisible(true)}
                    />
                  </Input.Group>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={Strings.editCiltSequenceModalRemediationOplLabel}
                >
                  <Form.Item name="remediationOplSop" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Input.Group compact>
                    <Form.Item
                      name="remediationOplName"
                      noStyle
                    >
                      <Input
                        style={{ width: 'calc(100% - 32px)' }}
                        readOnly
                        placeholder={Strings.editCiltSequenceModalRemediationOplLabel}
                        value={remediationOplName} 
                        onChange={(e) => setRemediationOplName(e.target.value)}
                      />
                    </Form.Item>
                    <Button
                      icon={<SearchOutlined />}
                      onClick={() => setRemediationOplModalVisible(true)}
                    />
                  </Input.Group>
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
                  label={Strings.editCiltSequenceModalMachineStoppedLabel}
                  name="machineStopped"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={Strings.editCiltSequenceModalStatusLabel}
                  name="status"
                >
                  <Select placeholder={Strings.cardTypeTreeStatusPlaceholder}>
                    <Option value={Constants.STATUS_ACTIVE}>{Strings.active}</Option>
                    <Option value={Constants.STATUS_INACTIVE}>{Strings.inactive}</Option>
                    <Option value={Constants.STATUS_DRAFT}>{Strings.draft}</Option>
                    
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    Strings.editCiltSequenceModalQuantityPicturesCreateLabel
                  }
                  name="quantityPicturesCreate"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={12}>
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

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Punto de referencia"
                  name="referencePoint"
                >
                  <Input maxLength={10} placeholder="Ingrese el punto de referencia" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Seleccionable sin programación"
                  name="selectableWithoutProgramming"
                  valuePropName="checked"
                >
                  <Switch />
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

      {/* OPL Selection Modals - Renderizados en el body del documento para evitar problemas de z-index */}
      {createPortal(
        <>
          {referenceOplModalVisible && (
            <OplSelectionModal
              isVisible={true}
              onClose={() => setReferenceOplModalVisible(false)}
              onSelect={handleReferenceOplSelect}
            />
          )}
          
          {remediationOplModalVisible && (
            <OplSelectionModal
              isVisible={true}
              onClose={() => setRemediationOplModalVisible(false)}
              onSelect={handleRemediationOplSelect}
            />
          )}
        </>,
        document.body
      )}
    </>
  );
};

export default EditCiltSequenceModal;
