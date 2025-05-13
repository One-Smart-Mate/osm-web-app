import React, { useEffect, useState } from "react";
import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Upload,
  UploadFile,
  UploadProps,
  Image,
  DatePicker,
  Select,
  App as AntApp
} from "antd";
import {
  BsBuilding,
  BsBuildingGear,
  BsCashCoin,
  BsClockHistory,
  BsCloudUpload,
  BsDiagram3,
  BsFiles,
  BsMailbox,
  BsMap,
  BsPerson,
  BsPhone,
  BsPinMap,
  BsQrCode,
  BsTelephone,
  BsTelephoneOutbound,
} from "react-icons/bs";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import Strings from "../../../utils/localizations/Strings";
import {
  FIREBASE_IMAGE_FILE_TYPE,
  FIREBASE_SITE_DIRECTORY,
  handleUploadToFirebaseStorage,
} from "../../../config/firebaseUpload";
import { formatCompanyName, generateShortUUID } from "../../../utils/Extensions";
import { GetProp } from "antd/lib";
import { useGetCurrenciesMutation } from "../../../services/currencyService";
import { Currency } from "../../../data/currency/currency";
import { SiteUpdateForm } from "../../../data/site/site";
import moment from "moment";
import Constants from "../../../utils/Constants";
import AnatomyNotification from "../../components/AnatomyNotification";

interface SiteFormCardProps {
  form: FormInstance;
  initialValues?: SiteUpdateForm;
  onSubmit: (values: any) => void;
  onSuccessUpload?: (url: string) => void;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const SiteFormCard: React.FC<SiteFormCardProps> = ({
  form,
  initialValues,
  onSubmit,
  onSuccessUpload,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(Strings.empty);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [getCurrencies] = useGetCurrenciesMutation();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const { notification } = AntApp.useApp();

  useEffect(() => {
    console.log(JSON.stringify(initialValues));
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        logo: initialValues?.logo,
        dueDate: moment(initialValues?.dueDate)
      });
      if (initialValues?.logo) {
        setFileList([
          {
            uid: "-1",
            name: "logo",
            status: "done",
            url: initialValues.logo,
          },
        ]);
      }
      if (onSuccessUpload) {
        onSuccessUpload(initialValues.logo);
      }
    }
    handleGetCurrencies();
    if (form && !initialValues) {
        form.setFieldValue("siteCode", generateShortUUID());
        form.setFieldValue("status", Constants.STATUS_ACTIVE);
      }
  }, [initialValues, form]);

  const handleGetCurrencies = async () => {
    const response = await getCurrencies().unwrap();
    setCurrencies(response);
  };

  const currencyOptions = () => {
    return currencies.map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: currency.code,
    }));
  };

  const handleOnPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customUpload = async (options: any) => {
    const { file, onError, onSuccess } = options;
    try {
      const siteName = form.getFieldValue("name");
      let fileName: string =
        siteName != null && siteName != "" && siteName != undefined
          ? siteName
          : file.name;

      const uploadedUrl = await handleUploadToFirebaseStorage(
        FIREBASE_SITE_DIRECTORY,
        {
          name: formatCompanyName(fileName),
          originFileObj: file,
        },
        FIREBASE_IMAGE_FILE_TYPE
      );

      if (onSuccessUpload) {
        onSuccessUpload(uploadedUrl);
      }
      onSuccess(uploadedUrl, file);
    } catch (error) {
      AnatomyNotification.error(notification, error);
      onError(error);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <BsCloudUpload className="ml-4" />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            rules={[
              { required: true, message: Strings.requiredCompanyName },
              { max: 100 },
            ]}
            label={Strings.companyName}
            className="flex-1"
          >
            <Input
              maxLength={100}
              addonBefore={<BsBuilding />}
              placeholder={Strings.companyName}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyNameTooltip} />

          <Form.Item
            name="rfc"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredRFC },
              { max: 13 },
              { min: 12 },
            ]}
            label={Strings.rfc}
          >
            <Input
              maxLength={13}
              addonBefore={<BsFiles />}
              placeholder={Strings.rfc}
              onInput={(e) =>
                ((e.target as HTMLInputElement).value = (
                  e.target as HTMLInputElement
                ).value.toUpperCase())
              }
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteRfcTooltip} />
        </div>

        <div className="flex flex-row flex-wrap">
          <Form.Item name="siteCode" label={Strings.siteCode}>
            <Input  disabled addonBefore={<BsQrCode />} />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteCodeTooltip} />

          <Form.Item
            name="siteBusinessName"
            rules={[
              { required: true, message: Strings.requiredSiteBusinessName },
            ]}
            className="flex-1"
            label={Strings.siteBusinessName}
          >
            <Input
              maxLength={100}
              placeholder={Strings.siteBusinessName}
              addonBefore={<BsBuilding />}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteBusinessNameTooltip} />
        </div>

        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="siteType"
            rules={[{ required: true, message: Strings.requiredSiteType }]}
            className="flex-1"
            label={Strings.siteType}
          >
            <Input
              maxLength={20}
              placeholder={Strings.siteType}
              addonBefore={<BsBuildingGear />}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteTypeTooltip} />

          <Form.Item
            name="latitud"
            rules={[{ required: true, message: Strings.requiredLatitud }]}
            label={Strings.latitud}
          >
            <InputNumber
              maxLength={11}
              placeholder={Strings.latitud}
              addonBefore={<BsMap />}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteLatitudeTooltip} />

          <Form.Item
            name="longitud"
            rules={[{ required: true, message: Strings.requiredLongitud }]}
            label={Strings.longitud}
          >
            <InputNumber
              maxLength={11}
              placeholder={Strings.longitud}
              addonBefore={<BsMap />}
            />
          </Form.Item>

          <AnatomyTooltip title={Strings.siteLongitudeTooltip} />
        </div>

        <div className="flex w-full">
          <Form.Item
            name="address"
            label={Strings.companyAddress}
            rules={[
              { required: true, message: Strings.requiredAddress },
              { max: 200 },
            ]}
            className="flex-1"
          >
            <Input
              addonBefore={<BsPinMap />}
              placeholder={Strings.companyAddress}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyAddressTooltip} />
        </div>

        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="contact"
            label={Strings.contact}
            rules={[
              { required: true, message: Strings.requiredContacName },
              { max: 100 },
            ]}
            className="flex-1"
          >
            <Input
              maxLength={100}
              addonBefore={<BsPerson />}
              placeholder={Strings.contact}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyContactNameTooltip} />

          <Form.Item
            name="position"
            label={Strings.position}
            rules={[
              { required: true, message: Strings.requiredPosition },
              { max: 100 },
            ]}
            className="flex-1"
          >
            <Input
              maxLength={100}
              addonBefore={<BsDiagram3 />}
              placeholder={Strings.position}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyPositionTooltip} />
        </div>

        <div className="flex flex-wrap flex-row">

        <Form.Item
            name="phone"
            rules={[{ required: true, message: Strings.requiredPhone }]}
            className="flex-1 mr-2"
            label={Strings.phone}
          >
            <InputNumber
              maxLength={13}
              addonBefore={<BsTelephone />}
              placeholder={Strings.phone}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyPhoneTooltip} />

          <Form.Item name="extension" label={Strings.extension}>
            <InputNumber
              maxLength={5}
              addonBefore={<BsTelephoneOutbound />}
              placeholder={Strings.extension}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyExtensionTooltip} />

          <Form.Item
            name="cellular"
            rules={[{ required: true, message: Strings.requiredCellular }]}
            className="flex-1"
            label={Strings.cellular}
          >
            <InputNumber
              maxLength={13}
              addonBefore={<BsPhone />}
              placeholder={Strings.cellular}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyCellularTooltip} />
        </div>

        <div className="flex w-full">
          <Form.Item
            name="email"
            label={Strings.email}
            rules={[
              { required: true, message: Strings.requiredEmail },
              { type: "email", message: Strings.requiredValidEmailAddress },
              { max: 60 },
            ]}
            className="flex-1"
          >
            <Input
              maxLength={60}
              addonBefore={<BsMailbox />}
              placeholder={Strings.email}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyEmailTooltip} />
        </div>

        <div className="flex flex-row">
          <Form.Item
            name="dueDate"
            label={Strings.dueDate}
            rules={[{ required: true, message: Strings.requiredDueDate }]}
            className="mr-2"
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder={Strings.dueDate}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteDueDateTooltip} />

          <Form.Item
            name="monthlyPayment"
            label={Strings.monthlyPayment}
            rules={[
              { required: true, message: Strings.requiredMonthlyPayment },
            ]}
            className="mr-2"
          >
            <InputNumber
              maxLength={12}
              placeholder={Strings.monthlyPayment}
              addonBefore={<BsCashCoin />}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteMonthlyPaymentTooltip} />

          <Form.Item
            name="currency"
            label={Strings.currency}
            rules={[{ required: true, message: Strings.requiredCurrency }]}
            className="w-72"
          >
            <Select
              options={currencyOptions()}
              placeholder={Strings.currency}
            
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.siteCurrencyTooltip} />
        </div>

        <div className="flex">
          <Form.Item
            name="appHistoryDays"
            label={Strings.appHistoryDays}
            rules={[
              { required: true, message: Strings.requiredAppHistoryDays },
            ]}
          >
            <InputNumber
              maxLength={3}
              placeholder={Strings.appHistoryDays}
              addonBefore={<BsClockHistory />}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.appHistoryDaysTooltip} />
        </div>

        <div className="flex items-center w-full">
          <Form.Item
            name="logo"
            label={Strings.logo}
            getValueFromEvent={(event) => event?.fileList}
          >
            <Upload
              maxCount={1}
              accept="image/*"
              listType="picture-card"
              onPreview={handleOnPreview}
              onChange={handleChange}
              fileList={fileList}
              customRequest={customUpload}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
          <AnatomyTooltip title={Strings.companyLogoTooltip} />
        </div>

        <Form.Item>
          {previewImage && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}
        </Form.Item>

         <Form.Item name="status" className="hidden">
                  <Input />
                </Form.Item>
      </div>
    </Form>
  );
};

export default SiteFormCard;
