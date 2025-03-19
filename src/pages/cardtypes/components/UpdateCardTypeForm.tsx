import {
  Form,
  FormInstance,
  Input,
  Select,
  ColorPicker,
  InputNumber,
  Tooltip,
  Button,
} from "antd";
import Strings from "../../../utils/localizations/Strings";
import { useAppSelector } from "../../../core/store";
import { selectSiteId } from "../../../core/genericReducer";
import { useEffect, useState } from "react";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useGetStatusMutation } from "../../../services/statusService";
import { Responsible } from "../../../data/user/user";
import { AiOutlinePicture } from "react-icons/ai";
import { GoDeviceCameraVideo } from "react-icons/go";
import { IoHeadsetOutline } from "react-icons/io5";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { notification } from "antd";

interface FormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  initialValues: any;
}

type Color = string;

const UpdateCardTypeForm = ({ form, initialValues }: FormProps) => {
  const [getResponsibles] = useGetSiteResponsiblesMutation();
  const [] = useGetStatusMutation();
  const siteId = useAppSelector(selectSiteId);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [color, setColor] = useState<Color>("FFFFFF");

  const handleGetData = async () => {
    if (!siteId) {
      console.error("siteId is undefined.");
      return;
    }

    try {
      const responsiblesResponse = await getResponsibles(siteId).unwrap();
      setResponsibles(responsiblesResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({
        message: "Fetching Error",
        description: "There was an error fetching your data. Please try again later.",
        placement: "topRight",
      });
    }
  };

  const responsibleOptions = () =>
    responsibles.map((responsible) => ({
      value: responsible.id,
      label: responsible.name,
    }));

  const statusOptions = [
    { value: Strings.activeStatus, label: Strings.active },
    { value: Strings.detailsOptionS, label: Strings.detailsStatusSuspended },
    { value: Strings.C, label: Strings.tagStatusCanceled },
  ];

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    if (initialValues && responsibles.length > 0) {
      const matchedResponsible = responsibles.find(
        (res) => res.id === initialValues.responsableId
      );
      form.setFieldsValue({
        ...initialValues,
        responsableId: matchedResponsible ? matchedResponsible.id : undefined,
        color: initialValues.color || "FFFFFF",
      });
      setColor(initialValues.color || "FFFFFF");
    }
  }, [initialValues, responsibles, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        console.log("Form Submitted:", values);
      }}
    >
      <Form.Item name="id" className="hidden">
        <Input />
      </Form.Item>
      <Form.Item name="methodology" className="hidden">
        <Input />
      </Form.Item>

      <div className="flex flex-col w-full space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item
              name="name"
              label={Strings.name}
              rules={[
                { required: true, message: Strings.requiredCardTypeName },
              ]}
              className="flex-1"
            >
              <Input placeholder={Strings.namePlaceholder} />
            </Form.Item>
            <Tooltip title={Strings.cardTypeNameTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6 mt-6" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <Form.Item
              name="description"
              label={Strings.description}
              rules={[{ required: true, message: Strings.requiredDescription }]}
              className="flex-1"
            >
              <Input placeholder={Strings.descriptionPlaceholder} />
            </Form.Item>
            <Tooltip title={Strings.cardTypeDescriptionTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6 mt-6" />
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="color" label="Color" className="flex-none">
              <ColorPicker
                value={color}
                onChange={(value) => {
                  const selectedColor =
                    typeof value === "string" ? value : value.toHexString();
                  const colorWithoutHash = selectedColor.startsWith("#")
                    ? selectedColor.slice(1)
                    : selectedColor;

                  setColor(colorWithoutHash);
                  form.setFieldValue("color", colorWithoutHash);
                }}
              >
                <Button
                  size="large"
                  style={{
                    backgroundColor: `#${color}`,
                    color: "#000",
                  }}
                >
                  {Strings.color}
                </Button>
              </ColorPicker>
            </Form.Item>
            <Tooltip title={Strings.cardTypeColorTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6 mt-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item
              name="responsableId"
              label={Strings.responsible}
              rules={[
                { required: true, message: Strings.requiredResponsableId },
              ]}
              className="flex-1"
            >
              <Select
                options={responsibleOptions()}
                placeholder={Strings.responsiblePlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.responsibleTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6 mt-6" />
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Form.Item
            name="status"
            label={Strings.status}
            rules={[{ required: true, message: Strings.requiredStatus }]}
            className="w-60"
          >
            <Select
              size="large"
              options={statusOptions}
              placeholder={Strings.statusPlaceholder}
            />
          </Form.Item>
        </div>

        <h2 className="font-semibold mt-6">{Strings.atCreation}</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="quantityPicturesCreate">
              <InputNumber
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.cardTypeTreeQuantityPicturesPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesCreateTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityVideosCreate">
              <InputNumber
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.cardTypeTreeQuantityVideosPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosCreateTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="videosDurationCreate">
              <InputNumber
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.videosDurationCreateTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityAudiosCreate">
              <InputNumber
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.cardTypeTreeQuantityAudiosPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosCreateTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="audiosDurationCreate">
              <InputNumber
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationCreateTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <h2 className="font-semibold mt-6">{Strings.atProvisionalSolution}</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="quantityPicturesPs">
              <InputNumber
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.cardTypeTreeQuantityPicturesPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesPsTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityVideosPs">
              <InputNumber
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.cardTypeTreeQuantityVideosPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosPsTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="videosDurationPs">
              <InputNumber
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.videosDurationPsTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityAudiosPs">
              <InputNumber
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.cardTypeTreeQuantityAudiosPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosPsTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="audiosDurationPs">
              <InputNumber
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationPsTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <h2 className="font-semibold mt-6">{Strings.atDefinitiveSolution}</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="quantityPicturesClose">
              <InputNumber
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.cardTypeTreeQuantityPicturesPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesCloseTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityVideosClose">
              <InputNumber
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.cardTypeTreeQuantityVideosPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosCloseTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="videosDurationClose">
              <InputNumber
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.videosDurationCloseTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityAudiosClose">
              <InputNumber
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.cardTypeTreeQuantityAudiosPlaceholder}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosCloseTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="audiosDurationClose">
              <InputNumber
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationCloseTooltip}>
              <QuestionCircleOutlined className="text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="primary" htmlType="submit">
            {Strings.save}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default UpdateCardTypeForm;
