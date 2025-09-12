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
import { useEffect, useState } from "react";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";
import { CardTypesCatalog } from "../../../data/cardtypes/cardTypes";
import { IoHeadsetOutline } from "react-icons/io5";
import { GoDeviceCameraVideo } from "react-icons/go";
import { useGetCardTypesCatalogsMutation } from "../../../services/CardTypesService";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { useLocation } from "react-router-dom";
import Loading from "../../components/Loading";

type Color = Extract<
  GetProp<ColorPickerProps, "value">,
  string | { cleared: any }
>;

interface FormProps {
  form: FormInstance;
  onSubmit: (_values: any) => void;
  initialValues?: any;
  enableStatus: boolean;
}

const CardTypeFormCard = ({ form, initialValues, onSubmit, enableStatus }: FormProps) => {
  const location = useLocation();
  const [isLoading, setLoading] = useState(false);
  const [getResponsibles] = useGetSiteResponsiblesMutation();
  const [getCardTypesCatalogs] = useGetCardTypesCatalogsMutation();
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [catalogs, setCatalogs] = useState<CardTypesCatalog[]>([]);
  const [color, setColor] = useState<Color>("FFFFFF");

  const handleGetData = async () => {
    try {
      setLoading(true);
      const responseResponsibles = await getResponsibles(
        location.state.siteId
      ).unwrap();
      const responseCardTypes = await getCardTypesCatalogs().unwrap();
      setResponsibles(responseResponsibles);
      setCatalogs(responseCardTypes);
      await handleInitFormValues(responseCardTypes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const handleInitFormValues = async (cardTypesCatalog: CardTypesCatalog[]) => {
    if (initialValues) {
      const formattedCardTypeMethodology =
        typeof initialValues.cardTypeMethodology === "string"
          ? `${initialValues.methodology || ""} - ${
              initialValues.cardTypeMethodology
            }`
          : `${initialValues.cardTypeMethodologyName || ""} - ${
              initialValues.cardTypeMethodology || ""
            }`;
      const matchingOption = catalogsOptions(cardTypesCatalog).find(
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
  };

  const responsibleOptions = () => {
    return responsibles.map((responsible) => ({
      value: responsible.id,
      label: responsible.name,
    }));
  };
  const catalogsOptions = (cardTypesCatalog: CardTypesCatalog[]) =>
    cardTypesCatalog.map((catalog) => ({
      value: `${catalog.cardTypeMethodologyName} - ${catalog.cardTypeMethodology}`,
      label: `${catalog.cardTypeMethodologyName} - ${catalog.cardTypeMethodology}`,
    }));

  const statusOptions = [
    { value: Strings.activeStatus, label: Strings.active },
    { value: Strings.detailsOptionS, label: Strings.detailsStatusSuspended },
    { value: Strings.C, label: Strings.tagStatusCanceled },
  ];

  return (
    <>
      <Loading isLoading={isLoading} />
      {!isLoading && (
        <Form form={form} onFinish={onSubmit} layout="vertical">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item name="methodology" className="hidden">
            <Input />
          </Form.Item>
          <div className="flex flex-col w-full">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Form.Item
                  validateFirst
                  rules={[
                    { required: true, message: Strings.requiredMethodology },
                  ]}
                  name="cardTypeMethodology"
                  className="flex-1"
                  label={Strings.cardTypeMethodology}
                >
                  <Select
                    placeholder={Strings.cardTypeMethodology}
                    options={catalogsOptions(catalogs)}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.cardTypeMethodologyTooltip} />
              </div>

              <div className="flex items-center">
                <Form.Item
                  name="name"
                  validateFirst
                  rules={[
                    { required: true, message: Strings.requiredCardTypeName },
                    { max: 45 },
                  ]}
                  className="flex-1"
                  label={Strings.name}
                >
                  <Input
                    addonBefore={<LuTextCursor />}
                    maxLength={45}
                    placeholder={Strings.name}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.cardTypeNameTooltip} />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <Form.Item
                  name="description"
                  label={Strings.description}
                  validateFirst
                  rules={[
                    { required: true, message: Strings.requiredDescription },
                    { max: 100 },
                  ]}
                  className="flex-1"
                >
                  <Input
                    maxLength={100}
                    addonBefore={<BsCardText />}
                    placeholder={Strings.description}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.cardTypeDescriptionTooltip} />
              </div>
            </div>

            <div className="flex items-center">
              <Form.Item
                name="color"
                validateFirst
                rules={[{ required: true, message: Strings.requiredColor }]}
                className="flex-none"
                label={Strings.color}
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
              <AnatomyTooltip title={Strings.cardTypeColorTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="responsableId"
                validateFirst
                label={Strings.responsible}
                rules={[
                  { required: true, message: Strings.requiredResponsableId },
                ]}
                className="flex-1"
              >
                <Select
                  placeholder={Strings.responsible}
                  options={responsibleOptions()}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.responsibleTooltip} />
            </div>

            <h1 className="font-semibold mt-4 mb-2">{Strings.atCreation}</h1>
            <div className="flex items-center">
              <Form.Item
                name="quantityPicturesCreate"
                validateFirst
                label={Strings.quantityPictures}
              >
                <InputNumber
                  max={255}
                  addonBefore={<AiOutlinePicture />}
                  placeholder={Strings.quantityPictures}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.quantityPicturesCreateTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="quantityVideosCreate"
                validateFirst
                label={Strings.quantityVideos}
              >
                <InputNumber
                  max={255}
                  addonBefore={<GoDeviceCameraVideo />}
                  placeholder={Strings.quantityVideos}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.quantityVideosCreateTooltip} />
            </div>
            <div className="flex items-center">
              <Form.Item
                name="videosDurationCreate"
                validateFirst
                label={Strings.durationInSeconds}
              >
                <InputNumber
                  maxLength={10}
                  addonBefore={<GoDeviceCameraVideo />}
                  placeholder={Strings.durationInSeconds}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.videosDurationCreateTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="quantityAudiosCreate"
                validateFirst
                label={Strings.quantityAudios}
              >
                <InputNumber
                  max={255}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.quantityAudios}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.quantityAudiosCreateTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="audiosDurationCreate"
                validateFirst
                label={Strings.durationInSeconds}
              >
                <InputNumber
                  maxLength={10}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.durationInSeconds}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.audiosDurationCreateTooltip} />
            </div>

            <h1 className="font-semibold mt-4 mb-2">
              {Strings.atProvisionalSolution}
            </h1>
            <div className="flex flex-col">
              <div className="flex items-center">
                <Form.Item
                  name="quantityPicturesPs"
                  validateFirst
                  label={Strings.quantityPictures}
                >
                  <InputNumber
                    max={255}
                    addonBefore={<AiOutlinePicture />}
                    placeholder={Strings.quantityPictures}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.quantityPicturesPsTooltip} />
              </div>

              <div className="flex items-center">
                <Form.Item
                  name="quantityVideosPs"
                  validateFirst
                  label={Strings.quantityVideos}
                >
                  <InputNumber
                    max={255}
                    addonBefore={<GoDeviceCameraVideo />}
                    placeholder={Strings.quantityVideos}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.quantityVideosPsTooltip} />
              </div>

              <div className="flex items-center">
                <Form.Item
                  name="videosDurationPs"
                  validateFirst
                  label={Strings.durationInSeconds}
                >
                  <InputNumber
                    maxLength={10}
                    addonBefore={<GoDeviceCameraVideo />}
                    placeholder={Strings.durationInSeconds}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.videosDurationPsTooltip} />
              </div>

              <div className="flex items-center">
                <Form.Item
                  name="quantityAudiosPs"
                  validateFirst
                  label={Strings.quantityAudios}
                >
                  <InputNumber
                    max={255}
                    addonBefore={<IoHeadsetOutline />}
                    placeholder={Strings.quantityAudios}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.quantityAudiosPsTooltip} />
              </div>

              <div className="flex items-center">
                <Form.Item
                  name="audiosDurationPs"
                  validateFirst
                  label={Strings.durationInSeconds}
                >
                  <InputNumber
                    maxLength={10}
                    addonBefore={<IoHeadsetOutline />}
                    placeholder={Strings.durationInSeconds}
                  />
                </Form.Item>
                <AnatomyTooltip title={Strings.audiosDurationPsTooltip} />
              </div>
            </div>

            <h1 className="font-semibold mt-4 mb-2">
              {Strings.atDefinitiveSolution}
            </h1>
            <div className="flex items-center">
              <Form.Item
                name="quantityPicturesClose"
                validateFirst
                label={Strings.quantityPictures}
              >
                <InputNumber
                  max={255}
                  addonBefore={<AiOutlinePicture />}
                  placeholder={Strings.quantityPictures}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.quantityPicturesCloseTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="quantityVideosClose"
                validateFirst
                label={Strings.quantityVideos}
              >
                <InputNumber
                  max={255}
                  addonBefore={<GoDeviceCameraVideo />}
                  placeholder={Strings.quantityVideos}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.quantityVideosCloseTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="videosDurationClose"
                validateFirst
                label={Strings.durationInSeconds}
              >
                <InputNumber
                  maxLength={10}
                  addonBefore={<GoDeviceCameraVideo />}
                  placeholder={Strings.durationInSeconds}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.videosDurationCloseTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="quantityAudiosClose"
                validateFirst
                label={Strings.quantityAudios}
              >
                <InputNumber
                  max={255}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.quantityAudios}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.quantityAudiosCloseTooltip} />
            </div>

            <div className="flex items-center">
              <Form.Item
                name="audiosDurationClose"
                validateFirst
                label={Strings.durationInSeconds}
              >
                <InputNumber
                  maxLength={10}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.durationInSeconds}
                />
              </Form.Item>
              <AnatomyTooltip title={Strings.audiosDurationCloseTooltip} />
            </div>

            { enableStatus && <Form.Item
              name="status"
              label={Strings.status}
              rules={[{ required: true, message: Strings.requiredStatus }]}
              className="w-60"
            >
              <Select
                options={statusOptions}
                placeholder={Strings.statusPlaceholder}
              />
            </Form.Item>}
          </div>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              {Strings.save}
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
export default CardTypeFormCard;
