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
import { useEffect, useState } from "react";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useAppSelector } from "../../../core/store";
import { selectSiteId } from "../../../core/genericReducer";
import { Responsible } from "../../../data/user/user";
import { CardTypesCatalog } from "../../../data/cardtypes/cardTypes";
import { IoHeadsetOutline } from "react-icons/io5";
import { GoDeviceCameraVideo } from "react-icons/go";
import { useGetCardTypesCatalogsMutation } from "../../../services/CardTypesService";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { UserRoles } from "../../../utils/Extensions";

type Color = Extract<
  GetProp<ColorPickerProps, "value">,
  string | { cleared: any }
>;

interface FormProps {
  form: FormInstance;
  onFinish: (_values: any) => void;
  rol: UserRoles;
  initialValues?: any;
}

const RegisterCardTypeForm = ({ form, initialValues }: FormProps) => {
  const [getResponsibles] = useGetSiteResponsiblesMutation();
  const [getCardTypesCatalogs] = useGetCardTypesCatalogsMutation();
  const siteId = useAppSelector(selectSiteId);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [catalogs, setCatalogs] = useState<CardTypesCatalog[]>([]);
  const [color, setColor] = useState<Color>("FFFFFF");

  const handleGetData = async () => {
    const response1 = await getResponsibles(siteId).unwrap();
    const response2 = await getCardTypesCatalogs().unwrap();
    setResponsibles(response1);
    setCatalogs(response2);
  };

  useEffect(() => {
    if (siteId) {
      handleGetData();
    }
  }, [siteId]);
  useEffect(() => {
    if (initialValues) {
      console.log("InitialValues:", initialValues);

      const formattedCardTypeMethodology =
        typeof initialValues.cardTypeMethodology === "string"
          ? `${initialValues.methodology || ""} - ${
              initialValues.cardTypeMethodology
            }`
          : `${initialValues.cardTypeMethodologyName || ""} - ${
              initialValues.cardTypeMethodology || ""
            }`;

      console.log(
        "FormattedCardTypeMethodology:",
        formattedCardTypeMethodology
      );

      const matchingOption = catalogsOptions().find(
        (option) => option.value === formattedCardTypeMethodology
      );

      const validColor = initialValues.color?.startsWith("#")
        ? initialValues.color
        : `#${initialValues.color || "FFFFFF"}`;

      setColor(validColor);
      form.setFieldsValue({
        ...initialValues,
        cardTypeMethodology: matchingOption
          ? formattedCardTypeMethodology
          : null,
        color: validColor,
      });
    }
  }, [initialValues, catalogs]);

  const responsibleOptions = () => {
    return responsibles.map((responsible) => ({
      value: responsible.id,
      label: responsible.name,
    }));
  };
  const catalogsOptions = () =>
    catalogs.map((catalog) => ({
      value: `${catalog.cardTypeMethodologyName} - ${catalog.cardTypeMethodology}`,
      label: `${catalog.cardTypeMethodologyName} - ${catalog.cardTypeMethodology}`,
    }));

  return (
    <Form form={form}>
      <div className="flex flex-col w-full space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item
              validateFirst
              rules={[{ required: true, message: Strings.requiredMethodology }]}
              name="cardTypeMethodology"
              className="flex-1"
            >
              <Select
                size="large"
                placeholder={Strings.cardTypeMethodology}
                options={catalogsOptions()}
              />
            </Form.Item>
            <Tooltip title={Strings.cardTypeMethodologyTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
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
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item
              name="description"
              validateFirst
              rules={[
                { required: true, message: Strings.requiredDescription },
                { max: 100 },
              ]}
              className="flex-1"
            >
              <Input
                size="large"
                maxLength={100}
                addonBefore={<BsCardText />}
                placeholder={Strings.description}
              />
            </Form.Item>
            <Tooltip title={Strings.cardTypeDescriptionTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item
              name="color"
              validateFirst
              rules={[{ required: true, message: Strings.requiredColor }]}
              className="flex-none"
            >
              <ColorPicker
                value={color}
                onChange={(selectedColor) => {
                  const bgColor =
                    typeof selectedColor === "string"
                      ? selectedColor
                      : selectedColor.toHexString();
                  const colorWithoutHash = bgColor.replace("#", "");
                  setColor(`#${colorWithoutHash}`);
                  form.setFieldValue("color", colorWithoutHash);
                }}
              >
                <Button
                  size="large"
                  style={{
                    backgroundColor:
                      typeof color === "string" ? color : color.toHexString(),
                    color: "#000",
                  }}
                >
                  {Strings.color}
                </Button>
              </ColorPicker>
            </Form.Item>
            <Tooltip title={Strings.cardTypeColorTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item
              name="responsableId"
              validateFirst
              rules={[
                { required: true, message: Strings.requiredResponsableId },
              ]}
              className="flex-1"
            >
              <Select
                size="large"
                placeholder={Strings.responsible}
                options={responsibleOptions()}
              />
            </Form.Item>
            <Tooltip title={Strings.responsibleTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <h1 className="font-semibold">{Strings.atCreation}</h1>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="quantityPicturesCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesCreateTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityVideosCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.quantityVideos}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosCreateTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
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
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityAudiosCreate" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.quantityAudios}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosCreateTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="audiosDurationCreate" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationCreateTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <h1 className="font-semibold">{Strings.atProvisionalSolution}</h1>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="quantityPicturesPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesPsTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityVideosPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.quantityVideos}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosPsTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
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
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityAudiosPs" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.quantityAudios}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosPsTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
            <Form.Item name="audiosDurationPs" validateFirst>
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.durationInSeconds}
              />
            </Form.Item>
            <Tooltip title={Strings.audiosDurationPsTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>
        </div>

        <h1 className="font-semibold">{Strings.atDefinitiveSolution}</h1>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="quantityPicturesClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<AiOutlinePicture />}
                placeholder={Strings.quantityPictures}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityPicturesCloseTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityVideosClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<GoDeviceCameraVideo />}
                placeholder={Strings.quantityVideos}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityVideosCloseTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
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
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="quantityAudiosClose" validateFirst>
              <InputNumber
                size="large"
                max={255}
                addonBefore={<IoHeadsetOutline />}
                placeholder={Strings.quantityAudios}
              />
            </Form.Item>
            <Tooltip title={Strings.quantityAudiosCloseTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
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
              <QuestionCircleOutlined className="text-sm text-blue-500 mb-6" />
            </Tooltip>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button type="primary" htmlType="submit">
              {Strings.save}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};
export default RegisterCardTypeForm;
