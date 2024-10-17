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
type Color = Extract<GetProp<ColorPickerProps, 'value'>, string | { cleared: any }>;

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
        </div>
        <Form.Item
          name="description"
          validateFirst
          rules={[
            { required: true, message: Strings.requiredDescription },
            { max: 100 },
          ]}
        >
          <Input
            size="large"
            maxLength={100}
            addonBefore={<BsCardText />}
            placeholder={Strings.description}
          />
        </Form.Item>
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
        </div>
        <h1 className="font-semibold">{Strings.atCreation}</h1>
        <div className="flex flex-col">
          <div>
            <Form.Item name="quantityPicturesCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
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

            <Form.Item name="videosDurationCreate" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
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
          </div>
        </div>
        <h1 className="font-semibold">{Strings.atProvisionalSolution}</h1>
        <div className="flex flex-col">
          <div>
            <Form.Item name="quantityPicturesPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
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
            <Form.Item name="videosDurationPs" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
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
            <Form.Item name="audiosDurationPs" validateFirst className="mr-2">
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
          </div>
        </div>
        <h1 className="font-semibold">{Strings.atDefinitiveSolution}</h1>
        <div className="flex flex-col">
          <div>
            <Form.Item name="quantityPicturesClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
          </div>
          <div className="flex gap-1">
            <Form.Item name="quantityVideosClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.quantityVideos}
              />
            </Form.Item>
            <Form.Item name="videosDurationClose" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
          </div>
          <div className="flex gap-1">
            <Form.Item name="quantityAudiosClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.quantityAudios}
              />
            </Form.Item>
            <Form.Item
              name="audiosDurationClose"
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
          </div>
        </div>
        <Form.Item className="w-60" name="status">
          <Select size="large" options={statusOptions()} />
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateCardTypeForm;
