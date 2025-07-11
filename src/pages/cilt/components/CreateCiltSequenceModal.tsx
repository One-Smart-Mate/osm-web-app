import React, { useState, useEffect } from "react";
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
} from "antd";
import { useCreateCiltSequenceMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetCiltTypesBySiteMutation } from "../../../services/cilt/ciltTypesService";
// Removed frequency service import as it's no longer needed
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
// Removed CiltFrequency import as it's no longer needed
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import Strings from "../../../utils/localizations/Strings";

import OplSelectionModal from "./OplSelectionModal";
import {
  formatSecondsToNaturalTime,
} from "../../../utils/timeUtils";

const { TextArea } = Input;
const { Option } = Select;

interface CreateCiltSequenceModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onSuccess: () => void;
  siteId?: string | number;
}

const CreateCiltSequenceModal: React.FC<CreateCiltSequenceModalProps> = ({
  visible,
  cilt,
  onCancel,
  onSuccess,
  siteId,
}) => {
  const [form] = Form.useForm();
  const [createCiltSequence] = useCreateCiltSequenceMutation();
  const [getCiltTypesBySite] = useGetCiltTypesBySiteMutation();
  // Removed frequency service query

  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  // Removed ciltFrequencies state
  const [loading, setLoading] = useState(false);
  const [referenceOplModalVisible, setReferenceOplModalVisible] =
    useState(false);
  const [remediationOplModalVisible, setRemediationOplModalVisible] =
    useState(false);
  const [selectedReferenceOpl, setSelectedReferenceOpl] =
    useState<OplMstr | null>(null);
  const [selectedRemediationOpl, setSelectedRemediationOpl] =
    useState<OplMstr | null>(null);
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (visible && (cilt?.siteId || siteId)) {
      fetchCiltTypes();
      // Removed fetchCiltFrequencies call
    }

    if (visible) {
      form.resetFields();
      
      if (siteId) {
        form.setFieldsValue({ siteId: Number(siteId) });
      } else if (cilt?.siteId) {
        form.setFieldsValue({ siteId: Number(cilt.siteId) });
      }
      
      setSelectedReferenceOpl(null);
      setSelectedRemediationOpl(null);
      setFormattedTime("");
      setHours(0);
      setMinutes(0);
      setSeconds(0);
    }
  }, [visible, form, cilt, siteId]);

  useEffect(() => {
    // Initialize form with any needed default values when cilt changes
    if (cilt && visible) {
      // Form initialization if needed
    }
  }, [cilt, form, visible]);

  // Fetch CILT types and filter by active status
  const fetchCiltTypes = async () => {
    const siteIdToUse = siteId || cilt?.siteId;
    if (!siteIdToUse) return;

    setLoading(true);
    try {
      const response = await getCiltTypesBySite(
        String(siteIdToUse)
      ).unwrap();
      // Filter CILT types to only include those with status 'A' (active)
      const activeTypes = response ? response.filter(type => type.status === 'A') : [];
      setCiltTypes(activeTypes);
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: Strings.createCiltSequenceModalErrorLoadingTypes,
      });
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchCiltFrequencies function

  const handleReferenceOplSelect = (opl: OplMstr) => {
    setSelectedReferenceOpl(opl);
    form.setFieldsValue({
      referenceOplSopId: opl.id,
      referenceOplName: opl.title,
    });
  };

  const handleRemediationOplSelect = (opl: OplMstr) => {
    setSelectedRemediationOpl(opl);
    form.setFieldsValue({
      remediationOplSopId: opl.id,
      remediationOplName: opl.title,
    });
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
    const typeColor = getColorFromCiltType(ciltTypeId);
    form.setFieldsValue({ secuenceColor: typeColor });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Removed frequency validation as it's no longer needed

      const combinedData = {
        ...values,
        siteId: Number(cilt?.siteId || 0),
        siteName: "",
        ciltMstrId: Number(cilt?.id || 0),
        ciltMstrName: cilt?.ciltName || "",
      };

      if (
        combinedData.referencePoint === undefined ||
        combinedData.referencePoint === null
      ) {
        combinedData.referencePoint = "";
      }

      if (
        combinedData.selectableWithoutProgramming === undefined ||
        combinedData.selectableWithoutProgramming === null
      ) {
        combinedData.selectableWithoutProgramming = false;
      }

      // Simplified to create only one sequence without frequency loop
      const sequenceData = {
        siteId: Number(combinedData.siteId) || 0,
        siteName: combinedData.siteName || "",
        standardOk: combinedData.standardOk || "",
        ciltMstrId: Number(combinedData.ciltMstrId) || 0,
        ciltMstrName: combinedData.ciltMstrName || "",
        // Removed frequency fields as they are now optional
        referencePoint: combinedData.referencePoint || "",
        order: 0, // Use 0 so backend assigns the next available order
        secuenceList: combinedData.secuenceList || "",
        secuenceColor: getColorFromCiltType(combinedData.ciltTypeId) || "FF0000",
        ciltTypeId: Number(combinedData.ciltTypeId) || 0,
        ciltTypeName: ciltTypes.find((type) => type.id === combinedData.ciltTypeId)?.name || "",
        referenceOplSopId: Number(selectedReferenceOpl?.id) || 0,
        remediationOplSopId: Number(selectedRemediationOpl?.id) || 0,
        standardTime: Number(combinedData.standardTime) || 0,
        toolsRequired: combinedData.toolsRequired || "",
        stoppageReason: combinedData.stoppageReason ? 1 : 0,
        machineStopped: combinedData.machineStopped ? 1 : 0,
        quantityPicturesCreate: Number(combinedData.quantityPicturesCreate) || 1,
        quantityPicturesClose: Number(combinedData.quantityPicturesClose) || 1,
        selectableWithoutProgramming: combinedData.selectableWithoutProgramming ? 1 : 0,
        specialWarning: combinedData.specialWarning || null,
        status: "A",
        createdAt: new Date().toISOString(),
      };

      const response = await createCiltSequence(sequenceData).unwrap();
      console.log("Sequence creation response:", response);

      notification.success({
        message: Strings.createCiltSequenceModalSuccess,
        description: Strings.createCiltSequenceModalSuccessDescription,
      });

      form.resetFields();
      setSelectedReferenceOpl(null);
      setSelectedRemediationOpl(null);
      setFormattedTime("");
      setHours(0);
      setMinutes(0);
      setSeconds(0);

      onSuccess();

      setTimeout(() => {
        onCancel();
      }, 100);
    } catch (error) {
      console.error("Error creating CILT sequence:", error);
      notification.error({
        message: Strings.createCiltSequenceModalError,
        description: Strings.createCiltSequenceModalErrorDescription,
      });
    } finally {
      setLoading(false);
    }
  };

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
      className="cilt-sequence-modal"
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            stoppageReason: false,
            machineStopped: false,
            quantityPicturesCreate: 1,
            quantityPicturesClose: 1,
            referencePoint: "",
            selectableWithoutProgramming: false,
          }}
          className="max-h-[70vh] overflow-y-auto px-1"
        >
          {/* Hidden fields */}
          <Form.Item name="order" hidden>
            <InputNumber min={0} max={255} />
          </Form.Item>
          <Form.Item name="secuenceColor" hidden>
            <Input />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-primary text-lg font-semibold mb-4 border-b pb-2">
                  {Strings.createCiltSequenceModalBasicInfoTitle}
                </h3>

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
                    className="w-full h-10 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  >
                    {ciltTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Removed Frequencies field completely */}
              </div>

              {/* Time and Standard Info */}
              <div className="bg-white rounded-lg p-4">
                {/* Removed title as requested */}

                {/* Standard Time */}
                <Form.Item
                  name="standardTime"
                  label={`${Strings.editCiltSequenceModalStandardTimeLabel} (HH:MM:SS)`}
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

                {/* Standard OK */}
                <Form.Item
                  name="standardOk"
                  label={Strings.editCiltSequenceModalStandardOkLabel}
                  rules={[
                    {
                      required: true,
                      message: Strings.editCiltSequenceModalStandardOkRequired,
                    },
                    {
                      max: 100,
                      message: "Standard OK must not exceed 100 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder={
                      Strings.editCiltSequenceModalStandardOkPlaceholder
                    }
                    className="w-full h-10 text-base border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    maxLength={100}
                  />
                </Form.Item>
              </div>

              {/* Pictures */}
              <div className="bg-white rounded-lg p-4">
                {/* Removed title as requested */}

                <div className="grid grid-cols-2 gap-4">
                  {/* Quantity Pictures Create */}
                  <Form.Item
                    name="quantityPicturesCreate"
                    label={
                      Strings.editCiltSequenceModalQuantityPicturesCreateLabel
                    }
                    rules={[
                      {
                        required: true,
                        message:
                          Strings.editCiltSequenceModalQuantityPicturesCreateRequired,
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={255}
                      className="w-full h-10 text-base border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </Form.Item>

                  {/* Quantity Pictures Close */}
                  <Form.Item
                    name="quantityPicturesClose"
                    label={
                      Strings.editCiltSequenceModalQuantityPicturesCloseLabel
                    }
                    rules={[
                      {
                        required: true,
                        message:
                          Strings.editCiltSequenceModalQuantityPicturesCloseRequired,
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={255}
                      className="w-full h-10 text-base border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Right Column - Sequence Details */}
            <div className="space-y-4">
              {/* Sequence Details */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-primary text-lg font-semibold mb-4 border-b pb-2">
                  {Strings.createCiltSequenceModalDetailsTitle}
                </h3>

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
                    className="w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </Form.Item>

                {/* Tools Required */}
                <Form.Item
                  name="toolsRequired"
                  label={Strings.editCiltSequenceModalToolsRequiredLabel}
                  getValueFromEvent={(e) => e.target.value}
                >
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    className="w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder={Strings.editCiltSequenceModalToolsRequiredPlaceholder}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </Form.Item>

                {/* Special Warning */}
                <Form.Item
                  name="specialWarning"
                  label={Strings.specialWarning}
                  rules={[
                    {
                      max: 100,
                      message: "Special warning must not exceed 100 characters",
                    },
                  ]}
                  getValueFromEvent={(e) => e.target.value}
                >
                  <Input
                    placeholder={Strings.specialWarning}
                    className="w-full h-10 text-base border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    maxLength={100}
                  />
                </Form.Item>
              </div>

              {/* OPL References */}
              <div className="bg-white rounded-lg p-4">
                {/* Removed title as requested */}

                {/* Reference OPL/SOP */}
                <Form.Item
                  name="referenceOplSopId"
                  label={Strings.editCiltSequenceModalReferenceOplLabel}
                >
                  <div className="flex items-center space-x-2">
                    <Button
                      type="primary"
                      onClick={() => setReferenceOplModalVisible(true)}
                      className="flex-shrink-0"
                    >
                      {Strings.oplSelectionModalSelectButton}
                    </Button>
                    {selectedReferenceOpl ? (
                      <div className="border rounded p-2 flex-1 bg-gray-50 truncate">
                        {selectedReferenceOpl.title}
                      </div>
                    ) : (
                      <div className="border rounded p-2 flex-1 bg-gray-50 text-gray-400 italic">
                        {Strings.editCiltSequenceModalReferenceOplLabel}
                      </div>
                    )}
                    <Input type="hidden" value={selectedReferenceOpl?.id} />
                  </div>
                </Form.Item>

                {/* Remediation OPL/SOP */}
                <Form.Item
                  name="remediationOplSopId"
                  label={Strings.editCiltSequenceModalRemediationOplLabel}
                >
                  <div className="flex items-center space-x-2">
                    <Button
                      type="primary"
                      onClick={() => setRemediationOplModalVisible(true)}
                      className="flex-shrink-0"
                    >
                      {Strings.oplSelectionModalSelectButton}
                    </Button>
                    {selectedRemediationOpl ? (
                      <div className="border rounded p-2 flex-1 bg-gray-50 truncate">
                        {selectedRemediationOpl.title}
                      </div>
                    ) : (
                      <div className="border rounded p-2 flex-1 bg-gray-50 text-gray-400 italic">
                        {Strings.editCiltSequenceModalRemediationOplLabel}
                      </div>
                    )}
                    <Input type="hidden" value={selectedRemediationOpl?.id} />
                  </div>
                </Form.Item>
              </div>

              {/* Machine Status */}
              <div className="bg-white rounded-lg p-4">
                {/* Removed title as requested */}

                <div className="grid grid-cols-2 gap-4">
                  {/* Stoppage Reason */}
                  <Form.Item
                    name="stoppageReason"
                    label={Strings.editCiltSequenceModalStoppageReasonLabel}
                  >
                    <Radio.Group>
                      <Radio value={true}>{Strings.yes}</Radio>
                      <Radio value={false}>{Strings.no}</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {/* Machine Stopped */}
                  <Form.Item
                    name="machineStopped"
                    label={Strings.editCiltSequenceModalMachineStoppedLabel}
                  >
                    <Radio.Group>
                      <Radio value={true}>{Strings.yes}</Radio>
                      <Radio value={false}>{Strings.no}</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>

                {/* Reference Point */}
                <Form.Item 
                  name="referencePoint" 
                  label={Strings.referencePoint}
                  rules={[
                    {
                      max: 10,
                      message: "Reference point must not exceed 10 characters",
                    },
                  ]}
                >
                  <Input
                    maxLength={10}
                    placeholder={Strings.referencePoint}
                    className="w-full h-10 text-base border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </Form.Item>

                {/* Selectable Without Programming */}
                <Form.Item
                  name="selectableWithoutProgramming"
                  label={Strings.selectableWithoutProgramming}
                >
                  <Radio.Group>
                    <Radio value={true}>{Strings.yes}</Radio>
                    <Radio value={false}>{Strings.no}</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-3 sticky bottom-0 bg-white py-3 border-t">
            <Button onClick={handleCancel} className="min-w-[100px]">
              {Strings.cancel}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="min-w-[100px]"
            >
              {Strings.save}
            </Button>
          </div>
        </Form>
      </Spin>

      {/* OPL Selection Modals */}
      <OplSelectionModal
        isVisible={referenceOplModalVisible}
        onClose={() => setReferenceOplModalVisible(false)}
        onSelect={handleReferenceOplSelect}
        siteId={siteId || (cilt?.siteId ? Number(cilt.siteId) : undefined)}
      />

      <OplSelectionModal
        isVisible={remediationOplModalVisible}
        onClose={() => setRemediationOplModalVisible(false)}
        onSelect={handleRemediationOplSelect}
        siteId={siteId || (cilt?.siteId ? Number(cilt.siteId) : undefined)}
      />
    </Modal>
  );
};

export default CreateCiltSequenceModal;
