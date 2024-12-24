import {
  Button,
  ColorPicker,
  ColorPickerProps,
  Form,
  FormInstance,
  GetProp,
  Input,
  InputNumber,
  Select,
  Tooltip,
} from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { AiOutlinePicture } from "react-icons/ai";
import { LuTextCursor } from "react-icons/lu";
import { CardTypeUpdateForm } from "../../../data/cardtypes/cardTypes";
import { useAppSelector } from "../../../core/store";
import {
  selectCurrentRowData,
  selectSiteId,
} from "../../../core/genericReducer";
import { useEffect, useMemo, useState } from "react";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";
import { GoDeviceCameraVideo } from "react-icons/go";
import { IoHeadsetOutline } from "react-icons/io5";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";
import { QuestionCircleOutlined } from "@ant-design/icons";

type Color = Extract<
  GetProp<ColorPickerProps, "value">,
  string | { cleared: any }
>;

interface FormProps {
  form: FormInstance;
}

const UpdateCardTypeForm = ({ form }: FormProps) => {
  const rowData = useAppSelector(
    selectCurrentRowData
  ) as unknown as CardTypeUpdateForm;
  const [getResponsibles] = useGetSiteResponsiblesMutation();
  const [getStatus] = useGetStatusMutation();
  const siteId = useAppSelector(selectSiteId);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [color, setColor] = useState<Color>(Strings.empty);

  const bgColor = useMemo<string>(
    () => (typeof color === "string" ? color : color!.toHexString()),
    [color]
  );

  const btnStyle: React.CSSProperties = {
    backgroundColor: bgColor,
  };

  const handleGetData = async () => {
    const [responsiblesResponse, statusResponse] = await Promise.all([
      getResponsibles(siteId).unwrap(),
      getStatus().unwrap(),
    ]);
    setResponsibles(responsiblesResponse);
    setStatuses(statusResponse);
  };

  const responsibleOptions = () => {
    return responsibles.map((responsible) => ({
      value: responsible.id,
      label: responsible.name,
    }));
  };
  const statusOptions = () => {
    return statuses.map((status) => ({
      value: status.statusCode,
      label: status.statusName,
    }));
  };
  useEffect(() => {
    form.setFieldsValue({ ...rowData });
    setColor(`#${rowData.color}`);
    handleGetData();
  }, []);
  return (
    <Form form={form}>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between flex-wrap">
          <Form.Item className="hidden" name="id">
            <Input />
          </Form.Item>
          <Form.Item className="hidden" name="methodology">
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredCardTypeName },
              { max: 45 },
            ]}
            className="flex-1"
          >
            <Input
              addonBefore={<LuTextCursor />}
              size="large"
              maxLength={45}
              placeholder={Strings.name}
            />
          </Form.Item>
          <Tooltip title={Strings.cardTypeNameTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <div className="flex items-center w-full">
          <Form.Item
            name="description"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredDescription },
              { max: 100 },
            ]}
            className="flex-grow"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<BsCardText />}
              placeholder={Strings.description}
            />
          </Form.Item>
          <Tooltip title={Strings.cardTypeDescriptionTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="color"
            validateFirst
            rules={[{ required: true, message: Strings.requiredColor }]}
            className="mr-3"
          >
            <ColorPicker value={color} onChange={setColor}>
              <Button
                size="large"
                className="w-32"
                type="primary"
                style={btnStyle}
              >
                Color
              </Button>
            </ColorPicker>
          </Form.Item>
          <Tooltip title={Strings.cardTypeColorTooltip}>
            <QuestionCircleOutlined className="ml-0 mr-3 mb-6 text-sm text-blue-500" />
          </Tooltip>
          <Form.Item
            name="responsableId"
            validateFirst
            rules={[{ required: true, message: Strings.requiredResponsableId }]}
            className="w-60"
          >
            <Select
              size="large"
              placeholder={Strings.responsible}
              options={responsibleOptions()}
              className=""
            />
          </Form.Item>
          <Tooltip title={Strings.responsibleTooltip}>
            <QuestionCircleOutlined className="ml-3 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <h1 className="font-semibold">{Strings.atCreation}</h1>
        <div className="flex flex-col">
          <div className="flex">
            <Form.Item name="quantityPicturesCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesCreateTooltip}>
              <QuestionCircleOutlined className="ml-3 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex gap-1">
            <Form.Item name="quantityVideosCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.quantityVideos}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosCreateTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
            <Form.Item name="videosDurationCreate" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.videosDurationCreateTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex gap-1">
            <Form.Item name="quantityAudiosCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.quantityAudios}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosCreateTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
            <Form.Item
              name="audiosDurationCreate"
              validateFirst
              className="mr-2"
            >
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationCreateTooltip}>
              <QuestionCircleOutlined className="mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <h1 className="font-semibold">{Strings.atProvisionalSolution}</h1>
        <div className="flex flex-col">
          <div className="flex">
            <Form.Item name="quantityPicturesPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesPsTooltip}>
              <QuestionCircleOutlined className="ml-3 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex gap-1">
            <Form.Item name="quantityVideosPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.videosCreatePs}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosPsTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
            <Form.Item name="videosDurationPs" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.videosDurationPsTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex gap-1">
            <Form.Item name="quantityAudiosPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.audiosCreatePs}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosPsTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
            <Form.Item name="audiosDurationPs" validateFirst className="mr-2">
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationPsTooltip}>
              <QuestionCircleOutlined className="ml-0 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <h1 className="font-semibold">{Strings.atDefinitiveSolution}</h1>
        <div className="flex flex-col">
          <div className="flex items-center w-full">
            <Form.Item name="quantityPicturesClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesCloseTooltip}>
              <QuestionCircleOutlined className="ml-3 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>

          <div className="flex gap-1 items-center">
            <Form.Item name="quantityVideosClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.quantityVideos}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosCloseTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>

            <Form.Item name="videosDurationClose" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.videosDurationCloseTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>

          <div className="flex gap-1 items-center">
            <Form.Item name="quantityAudiosClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.quantityAudios}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosCloseTooltip}>
              <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>

            <Form.Item name="audiosDurationClose" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationCloseTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
            <div className="flex">
            <Form.Item className="w-60" name="status">
          <Select size="large" options={statusOptions()} />
        </Form.Item>
        <Tooltip title={Strings.statusCardTypeTooltip}>
              <QuestionCircleOutlined className="ml-3.5 mr-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
            </div>
      </div>
    </Form>
  );
};

export default UpdateCardTypeForm;
