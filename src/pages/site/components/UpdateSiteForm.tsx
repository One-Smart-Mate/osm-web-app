import {
  DatePicker,
  Form,
  FormInstance,
  GetProp,
  Image,
  Input,
  InputNumber,
  Select,
  Upload,
  UploadFile,
  UploadProps,
  Tooltip,
} from "antd";
import { MailOutlined } from "@ant-design/icons";
import { FaRegBuilding } from "react-icons/fa";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  MdOutlineCategory,
  MdOutlineLocalPhone,
  MdOutlineQrCodeScanner,
} from "react-icons/md";
import { SlCompass } from "react-icons/sl";
import { IoIosContact } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";
import { BsDiagram3 } from "react-icons/bs";
import { HiDevicePhoneMobile } from "react-icons/hi2";
import { TiPlusOutline } from "react-icons/ti";
import Strings from "../../../utils/localizations/Strings";
import { useEffect, useState } from "react";
import { CiBarcode } from "react-icons/ci";
import { IoBusinessOutline } from "react-icons/io5";
import { TbWorldLatitude, TbWorldLongitude } from "react-icons/tb";
import { FiDollarSign } from "react-icons/fi";
import { LuHistory } from "react-icons/lu";
import { useAppSelector } from "../../../core/store";
import { selectCurrentRowData } from "../../../core/genericReducer";
import { SiteUpdateForm } from "../../../data/site/site";
import moment from "moment";
import { useGetCurrenciesMutation } from "../../../services/currencyService";
import { Currency } from "../../../data/currency/currency";

interface FormProps {
  form: FormInstance;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UpdateSiteForm = ({ form }: FormProps) => {
  const rowData = useAppSelector(
    selectCurrentRowData
  ) as unknown as SiteUpdateForm;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(Strings.empty);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [getCurrencies] = useGetCurrenciesMutation();
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const handleGetData = async () => {
    const response = await getCurrencies().unwrap();
    setCurrencies(response);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const currencyOptions = () => {
    return currencies.map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: currency.code,
    }));
  };

  useEffect(() => {
    form.setFieldsValue({
      ...rowData,
      dueDate: moment(rowData?.dueDate),
      logoURL: rowData?.logo,
    });
    if (rowData?.logo) {
      setFileList([
        {
          uid: "-1",
          name: "logo",
          status: "done",
          url: rowData.logo,
        },
      ]);
    }
  }, []);

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
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Form form={form}>
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            validateDebounce={1000}
            rules={[
              { required: true, message: Strings.requiredCompanyName },
              { max: 100 },
            ]}
            className="flex-1 mr-1"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<FaRegBuilding />}
              placeholder={Strings.companyName}
            />
          </Form.Item>
          <Tooltip title={Strings.siteNameTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="rfc"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredRFC },
              { max: 13 },
              { min: 12 },
            ]}
          >
            <Input
              size="large"
              showCount
              maxLength={13}
              minLength={12}
              addonBefore={<MdOutlineQrCodeScanner />}
              placeholder={Strings.rfc}
              onInput={(e) =>
                ((e.target as HTMLInputElement).value = (
                  e.target as HTMLInputElement
                ).value.toUpperCase())
              }
            />
          </Form.Item>
          <Tooltip title={Strings.siteRfcTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex flex-row flex-wrap">
          <Form.Item name="siteCode" className="w-36">
            <Input size="large" disabled addonBefore={<CiBarcode />} />
          </Form.Item>
          <Tooltip title={Strings.siteCodeTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="siteBusinessName"
            rules={[
              { required: true, message: Strings.requiredSiteBusinessName },
            ]}
            className="flex-1 ml-1"
          >
            <Input
              size="large"
              maxLength={100}
              placeholder={Strings.siteBusinessName}
              addonBefore={<IoBusinessOutline />}
            />
          </Form.Item>
          <Tooltip title={Strings.siteBusinessNameTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex justify-between flex-row ">
          <Form.Item
            name="siteType"
            rules={[{ required: true, message: Strings.requiredSiteType }]}
          >
            <Input
              size="large"
              maxLength={20}
              placeholder={Strings.siteType}
              addonBefore={<MdOutlineCategory />}
            />
          </Form.Item>
          <Tooltip title={Strings.siteTypeTooltip}>
            <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="latitud"
            rules={[{ required: true, message: Strings.requiredLatitud }]}
          >
            <InputNumber
              size="large"
              maxLength={11}
              placeholder={Strings.latitud}
              addonBefore={<TbWorldLatitude />}
            />
          </Form.Item>
          <Tooltip title={Strings.siteLatitudeTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="longitud"
            rules={[{ required: true, message: Strings.requiredLongitud }]}
          >
            <InputNumber
              size="large"
              maxLength={11}
              placeholder={Strings.longitud}
              addonBefore={<TbWorldLongitude />}
            />
          </Form.Item>
          <Tooltip title={Strings.siteLongitudeTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex">
          <Form.Item
            name="address"
            className="flex-1"
            rules={[
              { required: true, message: Strings.requiredAddress },
              { max: 200 },
            ]}
          >
            <Input
              size="large"
              addonBefore={<SlCompass />}
              placeholder={Strings.companyAddress}
            />
          </Form.Item>
          <Tooltip title={Strings.siteAddressTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="contact"
            rules={[
              { required: true, message: Strings.requiredContacName },
              { max: 100 },
            ]}
            className="flex-1 mr-1"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<IoIosContact />}
              placeholder={Strings.contact}
            />
          </Form.Item>
          <Tooltip title={Strings.siteContactTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="position"
            rules={[
              { required: true, message: Strings.requiredPosition },
              { max: 100 },
            ]}
            className="flex-1"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<BsDiagram3 />}
              placeholder={Strings.position}
            />
          </Form.Item>
          <Tooltip title={Strings.sitePositionTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex justify-between flex-row ">
          <Form.Item
            name="phone"
            rules={[{ required: true, message: Strings.requiredPhone }]}
          >
            <InputNumber
              size="large"
              maxLength={10}
              addonBefore={<MdOutlineLocalPhone />}
              placeholder={Strings.phone}
            />
          </Form.Item>
          <Tooltip title={Strings.sitePhoneTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>

          <Form.Item name="extension">
            <InputNumber
              size="large"
              maxLength={5}
              addonBefore={<TiPlusOutline />}
              placeholder={Strings.extension}
            />
          </Form.Item>
          <Tooltip title={Strings.siteExtensionTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="cellular"
            rules={[{ required: true, message: Strings.requiredCellular }]}
          >
            <InputNumber
              size="large"
              maxLength={13}
              addonBefore={<HiDevicePhoneMobile />}
              placeholder={Strings.cellular}
            />
          </Form.Item>
          <Tooltip title={Strings.siteCellularTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex">
          <Form.Item
            name="email"
            className="flex-1"
            rules={[
              { required: true, message: Strings.requiredEmail },
              { type: "email", message: Strings.requiredValidEmailAddress },
              { max: 60 },
            ]}
          >
            <Input
              size="large"
              maxLength={60}
              addonBefore={<MailOutlined />}
              placeholder={Strings.email}
            />
          </Form.Item>
          <Tooltip title={Strings.siteEmailTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex flex-row">
          <Form.Item
            name="dueDate"
            rules={[{ required: true, message: Strings.requiredDueDate }]}
            className="mr-2"
          >
            <DatePicker
              size="large"
              format="YYYY-MM-DD"
              placeholder={Strings.dueDate}
            />
          </Form.Item>
          <Tooltip title={Strings.siteDueDateTooltip}>
            <QuestionCircleOutlined className="ml-0.5  mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          <Form.Item
            name="monthlyPayment"
            rules={[
              { required: true, message: Strings.requiredMonthlyPayment },
            ]}
            className="mr-2"
          >
            <InputNumber
              size="large"
              maxLength={12}
              placeholder={Strings.monthlyPayment}
              addonBefore={<FiDollarSign />}
            />
          </Form.Item>
          <Tooltip title={Strings.siteMonthlyPaymentTooltip}>
            <QuestionCircleOutlined className="ml-0.5 mb-6 mr-2 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>

          <Form.Item
            name="currency"
            rules={[{ required: true, message: Strings.requiredCurrency }]}
            className="w-72"
          >
            <Select
              size="large"
              options={currencyOptions()}
              placeholder={Strings.currency}
            />
          </Form.Item>
          <Tooltip title={Strings.siteCurrencyTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex">
          <Form.Item
            name="appHistoryDays"
            rules={[
              { required: true, message: Strings.requiredAppHistoryDays },
            ]}
          >
            <InputNumber
              size="large"
              maxLength={3}
              placeholder={Strings.appHistoryDays}
              addonBefore={<LuHistory />}
            />
          </Form.Item>
        <Tooltip title={Strings.appHistoryDaysTooltip}>
          <QuestionCircleOutlined className="ml-3 mb-6 text-blue-500 text-sm cursor-pointer" />
        </Tooltip>
        </div>
          <div className="flex">
          <Form.Item name="logoURL" className="hidden">
          <Input />
        </Form.Item>
        <Form.Item
          name="logo"
          label={Strings.logo}
          getValueFromEvent={(event) => event?.fileList}
          rules={[{ required: true, message: Strings.requiredLogo }]}
        >
          <Upload
            maxCount={1}
            accept="image/*"
            listType="picture-card"
            onPreview={handleOnPreview}
            onChange={handleChange}
            fileList={fileList}
          >
            {uploadButton}
          </Upload>
        </Form.Item>
        <Tooltip title={Strings.siteLogoTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
          </div>
        <Form.Item>
          {previewImage && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) =>
                  !visible && setPreviewImage(Strings.empty),
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

export default UpdateSiteForm;
