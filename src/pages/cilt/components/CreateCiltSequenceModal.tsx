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
  ColorPicker,
} from "antd";
import { useCreateCiltSequenceMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetCiltTypesBySiteMutation } from "../../../services/cilt/ciltTypesService";
import { useGetCiltFrequenciesAllMutation } from "../../../services/cilt/ciltFrequenciesService";
import { useCreateCiltSequenceFrequencyMutation } from "../../../services/cilt/ciltSequencesFrequenciesService";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import { CiltFrequency } from "../../../data/cilt/ciltFrequencies/ciltFrequencies";
import { CreateCiltSequenceDTO } from "../../../data/cilt/ciltSequences/ciltSequences";
import { CreateCiltSequencesFrequenciesDTO } from "../../../data/cilt/ciltSequencesFrequencies/ciltSequencesFrequencies";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import Strings from "../../../utils/localizations/Strings";
import CiltLevelTreeModal from "./CiltLevelTreeModal";
import OplSelectionModal from "./OplSelectionModal";

const { TextArea } = Input;
const { Option } = Select;

interface CreateCiltSequenceModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ExtendedCiltMstr extends CiltMstr {
  siteName?: string;
  areaId?: number;
  areaName?: string;
  positionName?: string;
}

const CreateCiltSequenceModal: React.FC<CreateCiltSequenceModalProps> = ({
  visible,
  cilt,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [createCiltSequence] = useCreateCiltSequenceMutation();
  const [getCiltTypesBySite] = useGetCiltTypesBySiteMutation();
  const [getCiltFrequenciesAll] = useGetCiltFrequenciesAllMutation();
  const [createCiltSequenceFrequency] =
    useCreateCiltSequenceFrequencyMutation();

  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  const [ciltFrequencies, setCiltFrequencies] = useState<CiltFrequency[]>([]);
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
  const [selectedReferenceOpl, setSelectedReferenceOpl] =
    useState<OplMstr | null>(null);
  const [selectedRemediationOpl, setSelectedRemediationOpl] =
    useState<OplMstr | null>(null);
  const [color, setColor] = useState<string>("#1677FF");

  useEffect(() => {
    if (visible && cilt?.siteId) {
      fetchCiltTypes();
      fetchCiltFrequencies();
    }

    if (visible) {
      form.resetFields();
      setSelectedLevel(null);
      setSelectedReferenceOpl(null);
      setSelectedRemediationOpl(null);
      setColor("#1677FF");
    }
  }, [visible, form]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedLevel(null);
      setSelectedReferenceOpl(null);
      setSelectedRemediationOpl(null);
    }
  }, [visible, form]);

  const fetchCiltTypes = async () => {
    if (!cilt?.siteId) return;

    setLoading(true);
    try {
      const response = await getCiltTypesBySite(String(cilt.siteId)).unwrap();
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

  const getSelectedColor = (color: string | undefined): string => {
    return color || "#1890ff";
  };

  const handleColorChange = (colorValue: any) => {
    const hexColor = colorValue.toHex().replace("#", "");
    setColor("#" + hexColor);
    form.setFieldsValue({ secuenceColor: hexColor });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (!values.frequencies || values.frequencies.length === 0) {
        notification.error({
          message: Strings.createCiltSequenceModalError,
          description: Strings.createCiltSequenceModalErrorNoFrequency,
        });
        return;
      }

      const createPromises = values.frequencies.map(
        async (frequencyId: number) => {
          const sequenceData: CreateCiltSequenceDTO = {
            siteId: values.siteId,
            siteName: "",
            areaId: values.areaId,
            areaName: "",
            positionId: values.positionId,
            positionName: values.positionName || "",
            ciltMstrId: values.ciltMstrId,
            ciltMstrName: "",
            levelId: values.levelId,
            levelName: selectedLevel?.name || "",
            order: values.order || 1,
            secuenceList: values.secuenceList,
            secuenceColor: values.secuenceColor || getSelectedColor(color),
            ciltTypeId: values.ciltTypeId,
            ciltTypeName:
              ciltTypes.find((type) => type.id === values.ciltTypeId)?.name ||
              "",
            referenceOplSop: selectedReferenceOpl?.id,
            remediationOplSop: selectedRemediationOpl?.id,
            toolsRequired: values.toolsRequired,
            stoppageReason: values.stoppageReason ? 1 : 0,
            standardOk: values.standardOk,
            quantityPicturesCreate: values.quantityPicturesCreate,
            quantityPicturesClose: values.quantityPicturesClose,
            createdAt: new Date().toISOString(),
          };

          const response = await createCiltSequence(sequenceData).unwrap();

          if (response && response.id) {
            const frequency = ciltFrequencies.find((f) => f.id === frequencyId);

            const sequenceFrequencyData: CreateCiltSequencesFrequenciesDTO = {
              siteId: values.siteId,
              positionId: values.positionId,
              ciltId: values.ciltMstrId,
              secuencyId: response.id,
              frecuencyId: frequencyId,
              frecuencyCode: frequency?.frecuencyCode || "",
              status: "A",
            };
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

      onSuccess();
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

  return (
    <Modal
      title={Strings.createCiltSequenceModalTitle}
      open={visible}
      onCancel={onCancel}
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
                  >
                    {ciltTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Level */}
                <Form.Item
                  name="levelId"
                  label={Strings.editCiltSequenceModalLevelLabel}
                  rules={[
                    {
                      required: true,
                      message: Strings.editCiltSequenceModalLevelRequired,
                    },
                  ]}
                >
                  <Input
                    readOnly
                    placeholder={Strings.editCiltSequenceModalSelectLevel}
                    value={selectedLevel?.name}
                    addonAfter={
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => setLevelTreeModalVisible(true)}
                      >
                        {Strings.select}
                      </Button>
                    }
                  />
                </Form.Item>

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
                  <Input
                    readOnly
                    placeholder={
                      Strings.editCiltSequenceModalSelectReferenceOpl
                    }
                    onClick={() => setReferenceOplModalVisible(true)}
                    value={
                      selectedReferenceOpl ? selectedReferenceOpl.title : ""
                    }
                    style={{ cursor: "pointer" }}
                  />
                </Form.Item>

                {/* Remediation OPL/SOP */}
                <Form.Item
                  name="remediationOplSop"
                  label={Strings.editCiltSequenceModalRemediationOplLabel}
                >
                  <Input
                    readOnly
                    placeholder={
                      Strings.editCiltSequenceModalSelectRemediationOpl
                    }
                    onClick={() => setRemediationOplModalVisible(true)}
                    value={
                      selectedRemediationOpl ? selectedRemediationOpl.title : ""
                    }
                    style={{ cursor: "pointer" }}
                  />
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

                {/* Sequence Color */}
                <Form.Item
                  name="secuenceColor"
                  label={Strings.editCiltSequenceModalColorLabel}
                  rules={[
                    {
                      required: true,
                      message: Strings.editCiltSequenceModalColorRequired,
                    },
                  ]}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <ColorPicker
                      value={color}
                      onChange={handleColorChange}
                      showText
                    />
                  </div>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              {/* Standard Time */}
              <Form.Item
                name="standardTime"
                label={Strings.editCiltSequenceModalStandardTimeLabel}
                rules={[
                  {
                    required: true,
                    message: Strings.editCiltSequenceModalStandardTimeRequired,
                  },
                ]}
              >
                <InputNumber min={0} step={0.5} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              {/* Stoppage Reason */}
              <Form.Item
                name="stoppageReason"
                label={Strings.editCiltSequenceModalStoppageReasonLabel}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
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
            </Col>
            <Col span={8}>
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
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={onCancel}>{Strings.cancel}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {Strings.save}
            </Button>
          </div>
        </Form>
      </Spin>

      {/* Level Tree Modal */}
      {cilt?.siteId && (
        <CiltLevelTreeModal
          isVisible={levelTreeModalVisible}
          onClose={() => setLevelTreeModalVisible(false)}
          siteId={String(cilt.siteId)}
          siteName={
            (cilt as ExtendedCiltMstr).siteName ||
            Strings.createCiltSequenceModalDefaultSiteName
          }
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
    </Modal>
  );
};

export default CreateCiltSequenceModal;
