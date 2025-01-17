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
  import { useEffect, useMemo, useState } from "react";
  import { useGetSiteResponsiblesMutation } from "../../../services/userService";
  import { useAppSelector } from "../../../core/store";
  import { selectSiteId } from "../../../core/genericReducer";
  import { Responsible } from "../../../data/user/user";
  import { CardTypesCatalog } from "../../../data/cardtypes/cardTypes";
  import { IoHeadsetOutline } from "react-icons/io5";
  import { GoDeviceCameraVideo } from "react-icons/go";
  import { useGetCardTypesCatalogsMutation } from "../../../services/CardTypesService";
  import { QuestionCircleOutlined } from "@ant-design/icons";
  
  type Color = Extract<GetProp<ColorPickerProps, "value">, string | { cleared: any }>;
  
  interface FormProps {
    form: FormInstance;
  }
  
  const RegisterCardTypeFormOriginal = ({ form }: FormProps) => {
    const [getResponsibles] = useGetSiteResponsiblesMutation();
    const [getCardTypesCatalogs] = useGetCardTypesCatalogsMutation();
    const siteId = useAppSelector(selectSiteId);
    const [responsibles, setResponsibles] = useState<Responsible[]>([]);
    const [catalogs, setCatalogs] = useState<CardTypesCatalog[]>([]);
    const [color, setColor] = useState<Color>(Strings.white);
  
    const bgColor = useMemo<string>(
      () => (typeof color === "string" ? color : color!.toHexString()),
      [color]
    );
  
    const btnStyle: React.CSSProperties = {
      backgroundColor: bgColor,
    };
  
    const handleGetData = async () => {
      try {
        const response1 = await getResponsibles(siteId).unwrap();
        const response2 = await getCardTypesCatalogs().unwrap();
        setResponsibles(response1);
        setCatalogs(response2);
    
        console.log("Catalogs Data:", response2);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
  
    useEffect(() => {
      handleGetData();
    }, []);
  
    const responsibleOptions = () => {
      return responsibles.map((responsible) => ({
        value: responsible.id,
        label: responsible.name,
      }));
    };
    const catalogsOptions = () => {
      return catalogs.map((catalog) => ({
        value: `${catalog.cardTypeMethodologyName} - ${catalog.cardTypeMethodology}`,
        label: `${catalog.cardTypeMethodologyName} - ${catalog.cardTypeMethodology}`,
      }));
    };
    
    console.log("Catalog Options:", catalogsOptions());

  
    return (
      <Form form={form}>
        <div className="flex flex-col">
          {/* Section: Card Type Methodology and Name */}
          <div className="flex flex-row justify-between flex-wrap items-center">
            <Form.Item
              validateFirst
              rules={[{ required: true, message: Strings.requiredMethodology }]}
              name="cardTypeMethodology"
              className="flex-1 mr-1"
            >
              <Select
                size="large"
                placeholder={Strings.cardTypeMethodology}
                options={catalogsOptions()}
              
              />
            </Form.Item>
            <Tooltip title={Strings.cardTypeMethodologyTooltip}>
              <QuestionCircleOutlined className="mb-6 ml-1 mr-2 text-sm text-blue-500" />
            </Tooltip>
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
  
          {/* Section: Description */}
          <div className="flex items-center">
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
  
          {/* Section: Color and Responsible */}
          <div className="flex flex-row flex-wrap items-center">
            <Form.Item
              name="color"
              validateFirst
              rules={[{ required: true, message: Strings.requiredColor }]}
              className="mr-3"
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
                <Button size="large" className="w-32 border" style={btnStyle}>
                  {Strings.color}
                </Button>
              </ColorPicker>
            </Form.Item>
            <Tooltip title={Strings.cardTypeColorTooltip}>
              <QuestionCircleOutlined className="mb-6 mr-2 text-sm text-blue-500" />
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
              />
            </Form.Item>
            <Tooltip title={Strings.responsibleTooltip}>
              <QuestionCircleOutlined className="mb-6 ml-2 text-sm text-blue-500" />
            </Tooltip>
          </div>
  
          {/* Section: At Creation */}
          <h1 className="font-semibold">{Strings.atCreation}</h1>
          <div className="flex flex-col">
            <div className="flex items-center">
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
            <div className="flex items-center gap-1">
              <Form.Item name="quantityVideosCreate" validateFirst>
                <InputNumber
                  size="large"
                  max={255}
                  addonBefore={<GoDeviceCameraVideo />}
                  placeholder={Strings.quantityVideos}
                />
              </Form.Item>
              <Tooltip title={Strings.quantityVideosCreateTooltip}>
                <QuestionCircleOutlined className="ml-2 mb-6  mr-2 text-sm text-blue-500" />
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
                <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-1">
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
              <Form.Item name="audiosDurationCreate" validateFirst>
                <InputNumber
                  size="large"
                  maxLength={10}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.durationInSeconds}
                />
              </Form.Item>
              <Tooltip title={Strings.audiosDurationCreateTooltip}>
                <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
              </Tooltip>
            </div>
          </div>
  
          {/* Section: At Provisional Solution */}
          <h1 className="font-semibold">{Strings.atProvisionalSolution}</h1>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Form.Item name="quantityPicturesPs" validateFirst>
                <InputNumber
                  size="large"
                  max={255}
                  addonBefore={<AiOutlinePicture />}
                  placeholder={Strings.quantityPictures}
                />
              </Form.Item>
              <Tooltip title={Strings.quantityPicturesPsTooltip}>
                <QuestionCircleOutlined className="ml-3 mb-6 text-sm text-blue-500" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-1">
              <Form.Item name="quantityVideosPs" validateFirst>
                <InputNumber
                  size="large"
                  max={255}
                  addonBefore={<GoDeviceCameraVideo />}
                  placeholder={Strings.quantityVideos}
                />
              </Form.Item>
              <Tooltip title={Strings.quantityVideosPsTooltip}>
                <QuestionCircleOutlined className="ml-2 mr-2  mb-6 text-sm text-blue-500" />
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
                <QuestionCircleOutlined className="ml-2  mb-6 text-sm text-blue-500" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-1">
              <Form.Item name="quantityAudiosPs" validateFirst>
                <InputNumber
                  size="large"
                  max={255}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.quantityAudios}
                />
              </Form.Item>
              <Tooltip title={Strings.quantityAudiosPsTooltip}>
                <QuestionCircleOutlined className="ml-2 mr-2 text-sm mb-6  text-blue-500" />
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
                <QuestionCircleOutlined className="ml-2 text-sm mb-6  text-blue-500" />
              </Tooltip>
            </div>
          </div>
  
          {/* Section: At Definitive Solution */}
          <h1 className="font-semibold">{Strings.atDefinitiveSolution}</h1>
          <div className="flex flex-col">
            <div className="flex items-center">
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
            <div className="flex items-center gap-1">
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
            <div className="flex items-center gap-1">
              <Form.Item name="quantityAudiosClose" validateFirst>
                <InputNumber
                  size="large"
                  max={255}
                  addonBefore={<IoHeadsetOutline />}
                  placeholder={Strings.quantityAudios}
                />
              </Form.Item>
              <Tooltip title={Strings.quantityAudiosCloseTooltip}>
                <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-sm text-blue-500" />
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
        </div>
      </Form>
    );
  };
  export default RegisterCardTypeFormOriginal;
  