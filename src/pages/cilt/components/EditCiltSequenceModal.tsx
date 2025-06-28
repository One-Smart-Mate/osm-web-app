import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Radio,
  Spin,
  notification,
  Row,
  Col,
} from "antd";  
import { SearchOutlined } from "@ant-design/icons";
import { useUpdateCiltSequenceMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetCiltTypesBySiteMutation } from "../../../services/cilt/ciltTypesService";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import Strings from "../../../utils/localizations/Strings";

import OplSelectionModal from "./OplSelectionModal";
import {
  formatSecondsToNaturalTime,
} from "../../../utils/timeUtils";
import Constants from "../../../utils/Constants";
import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";

const { TextArea } = Input;
const { Option } = Select;

interface EditCiltSequenceModalProps {
  open: boolean;
  sequence: CiltSequence | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditCiltSequenceModal: React.FC<EditCiltSequenceModalProps> = ({
  open,
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
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [referenceOplName, setReferenceOplName] = useState<string>("");
  const [remediationOplName, setRemediationOplName] = useState<string>("");
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (open && sequence) {
      // Debug to check if specialWarning exists in the sequence object
      console.log("Sequence object in edit modal:", sequence);
      if (sequence?.siteId) {
        getCiltTypesBySite(sequence.siteId.toString())
          .unwrap()
          .then((types) => {
            setCiltTypes(types);
          })
          .catch((error) => {
            console.error("Error fetching CILT types:", error);
          });
      }

      const loadFormData = async () => {
        if (!sequence) return;

        if (sequence.standardTime) {
          setFormattedTime(formatSecondsToNaturalTime(sequence.standardTime));
          // Convert seconds to hours, minutes, seconds
          const totalSeconds = sequence.standardTime;
          const h = Math.floor(totalSeconds / 3600);
          const m = Math.floor((totalSeconds % 3600) / 60);
          const s = totalSeconds % 60;
          setHours(h);
          setMinutes(m);
          setSeconds(s);
        } else {
          setFormattedTime("");
          setHours(0);
          setMinutes(0);
          setSeconds(0);
        }

        if (sequence.referenceOplSopId) {
          try {
            const referenceOpl = await getOplMstrById(
              String(sequence.referenceOplSopId)
            ).unwrap();
            setReferenceOplName(referenceOpl.title || "");
            form.setFieldsValue({ referenceOplName: referenceOpl.title });
          } catch (error) {
            console.error("Error al cargar el OPL de referencia:", error);
          }
        }

        if (sequence.remediationOplSopId) {
          try {
            const remediationOpl = await getOplMstrById(
              String(sequence.remediationOplSopId)
            ).unwrap();
            setRemediationOplName(remediationOpl.title || "");
            form.setFieldsValue({ remediationOplName: remediationOpl.title });
          } catch (error) {
            console.error("Error al cargar el OPL de remediación:", error);
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
          referenceOplSopId: sequence.referenceOplSopId,
          remediationOplSopId: sequence.remediationOplSopId,
          // Removed frequency field assignments as they are no longer needed
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
          specialWarning: sequence.specialWarning,
        });
      };

      loadFormData();
    }

    if (!open) {
      setReferenceOplName("");
      setRemediationOplName("");
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setFormattedTime("");
    }
  }, [open, sequence, form, getCiltTypesBySite, getOplMstrById]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleReferenceOplSelect = (opl: OplMstr) => {
    try {
      setReferenceOplName(opl.title || "");

      form.setFieldsValue({
        referenceOplSopId: opl.id,
        referenceOplName: opl.title,
      });

      setTimeout(() => {
        setReferenceOplModalVisible(false);
      }, 100);
    } catch (error) {
      console.error("Error al seleccionar OPL de referencia:", error);
    }
  };

  const handleRemediationOplSelect = (opl: OplMstr) => {
    try {
      setRemediationOplName(opl.title || "");

      form.setFieldsValue({
        remediationOplSopId: opl.id,
        remediationOplName: opl.title,
      });

      setTimeout(() => {
        setRemediationOplModalVisible(false);
      }, 100);
    } catch (error) {
      console.error("Error al seleccionar OPL de remediación:", error);
    }
  };

  const getColorFromCiltType = (ciltTypeId: number | undefined): string => {
    if (!ciltTypeId) return "1890ff";

    const selectedType = ciltTypes.find((type) => type.id === ciltTypeId);
    if (selectedType && selectedType.color) {
      return selectedType.color.startsWith("#")
        ? selectedType.color.substring(1)
        : selectedType.color;
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

      // Log to see form values before creating payload
      console.log("Form values before creating payload:", values);
      console.log("Special Warning value from form:", values.specialWarning);
      
      const payload = {
        id: values.id,
        siteId: Number(values.siteId),
        siteName: values.siteName || sequence.siteName || "",
        ciltMstrId: Number(values.ciltMstrId),
        ciltMstrName: values.ciltMstrName || sequence.ciltMstrName || "",
        // Removed frequency fields as they are now optional
        referencePoint: values.referencePoint || "",
        order: Number(values.order),
        secuenceList: values.secuenceList || "",
        secuenceColor: getColorFromCiltType(values.ciltTypeId),
        ciltTypeId: Number(values.ciltTypeId),
        ciltTypeName: ciltTypes.find((type) => type.id === values.ciltTypeId)?.name || values.ciltTypeName || "",
        referenceOplSopId: Number(values.referenceOplSopId) || 0,
        standardTime: Number(values.standardTime) || 0,
        standardOk: values.standardOk || "",
        remediationOplSopId: Number(values.remediationOplSopId) || 0,
        toolsRequired: values.toolsRequired || "",
        stoppageReason: values.stoppageReason ? 1 : 0,
        machineStopped: values.machineStopped ? 1 : 0,
        quantityPicturesCreate: Number(values.quantityPicturesCreate) || 0,
        quantityPicturesClose: Number(values.quantityPicturesClose) || 0,
        selectableWithoutProgramming: values.selectableWithoutProgramming ? 1 : 0,
        specialWarning: values.specialWarning || null,
        status: values.status || "A",
        updatedAt: new Date().toISOString(),
      };
      
      // Log to see final payload to be sent
      console.log("Final payload to be sent:", payload);

      delete (values as any).referenceOplName;
      delete (values as any).remediationOplName;

      // Removed frequency fallback logic as frequencies are now optional

      const response = await updateCiltSequence(payload).unwrap();
      
      // Log to see backend response
      console.log("Backend response after update:", response);

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
        title={Strings.editSequence}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={1000}
        destroyOnHidden={true}
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

            <div style={{ display: "none" }}>
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
              <Form.Item name="positionName" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="ciltMstrId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="ciltMstrName" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="levelId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="levelName" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="order" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="secuenceColor" hidden>
                <Input />
              </Form.Item>
              {/* Removed frequency hidden fields as they are no longer needed */}
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
                  placeholder={Strings.editCiltSequenceModalCiltTypePlaceholder}
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
                  label={`${Strings.editCiltSequenceModalStandardTimeLabel} (HH:MM:SS)`}
                  name="standardTime"
                  rules={[
                    {
                      required: true,
                      message:
                        Strings.editCiltSequenceModalStandardTimeRequired,
                    },
                  ]}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <InputNumber
                        min={0}
                        max={23}
                        value={hours}
                        onChange={(value) => {
                          const h = value || 0;
                          setHours(h);
                          const totalSeconds = h * 3600 + minutes * 60 + seconds;
                          form.setFieldsValue({ standardTime: totalSeconds });
                          setFormattedTime(formatSecondsToNaturalTime(totalSeconds));
                        }}
                        className="w-16"
                        placeholder="HH"
                      />
                      <span>:</span>
                      <InputNumber
                        min={0}
                        max={59}
                        value={minutes}
                        onChange={(value) => {
                          const m = value || 0;
                          setMinutes(m);
                          const totalSeconds = hours * 3600 + m * 60 + seconds;
                          form.setFieldsValue({ standardTime: totalSeconds });
                          setFormattedTime(formatSecondsToNaturalTime(totalSeconds));
                        }}
                        className="w-16"
                        placeholder="MM"
                      />
                      <span>:</span>
                      <InputNumber
                        min={0}
                        max={59}
                        value={seconds}
                        onChange={(value) => {
                          const s = value || 0;
                          setSeconds(s);
                          const totalSeconds = hours * 3600 + minutes * 60 + s;
                          form.setFieldsValue({ standardTime: totalSeconds });
                          setFormattedTime(formatSecondsToNaturalTime(totalSeconds));
                        }}
                        className="w-16"
                        placeholder="SS"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formattedTime && `(${formattedTime})`}
                    </span>
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
                  <Form.Item name="referenceOplSopId" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Input.Group compact>
                    <Form.Item name="referenceOplName" noStyle>
                      <Input
                        style={{ width: "calc(100% - 32px)" }}
                        readOnly
                        placeholder={
                          Strings.editCiltSequenceModalReferenceOplLabel
                        }
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
                  <Form.Item name="remediationOplSopId" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Input.Group compact>
                    <Form.Item name="remediationOplName" noStyle>
                      <Input
                        style={{ width: "calc(100% - 32px)" }}
                        readOnly
                        placeholder={
                          Strings.editCiltSequenceModalRemediationOplLabel
                        }
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
            
            {/* Special Warning */}
            <Form.Item
              label={Strings.specialWarning}
              name="specialWarning"
            >
              <Input
                placeholder={Strings.specialWarning}
                maxLength={100}
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
                >
                  <Radio.Group>
                    <Radio value={true}>{Strings.yes}</Radio>
                    <Radio value={false}>{Strings.no}</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={Strings.editCiltSequenceModalMachineStoppedLabel}
                  name="machineStopped"
                >
                  <Radio.Group>
                    <Radio value={true}>{Strings.yes}</Radio>
                    <Radio value={false}>{Strings.no}</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={Strings.editCiltSequenceModalStatusLabel}
                  name="status"
                >
                  <Select placeholder={Strings.cardTypeTreeStatusPlaceholder}>
                    <Option value={Constants.STATUS_ACTIVE}>
                      {Strings.active}
                    </Option>
                    <Option value={Constants.STATUS_INACTIVE}>
                      {Strings.inactive}
                    </Option>
                    <Option value={Constants.STATUS_DRAFT}>
                      {Strings.draft}
                    </Option>
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
                <Form.Item label={Strings.referencePoint} name="referencePoint">
                  <Input
                    maxLength={10}
                    placeholder={Strings.referencePoint}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={Strings.selectableWithoutProgramming}
                  name="selectableWithoutProgramming"
                >
                  <Radio.Group>
                    <Radio value={true}>{Strings.yes}</Radio>
                    <Radio value={false}>{Strings.no}</Radio>
                  </Radio.Group>
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

      {createPortal(
        <>
          {referenceOplModalVisible && (
            <OplSelectionModal
              isVisible={true}
              onClose={() => setReferenceOplModalVisible(false)}
              onSelect={handleReferenceOplSelect}
              siteId={sequence && sequence.siteId ? Number(sequence.siteId) : undefined}
            />
          )}

          {remediationOplModalVisible && (
            <OplSelectionModal
              isVisible={true}
              onClose={() => setRemediationOplModalVisible(false)}
              onSelect={handleRemediationOplSelect}
              siteId={sequence && sequence.siteId ? Number(sequence.siteId) : undefined}
            />
          )}
        </>,
        document.body
      )}
    </>
  );
};

export default EditCiltSequenceModal;
