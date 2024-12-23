import {
  Form,
  FormInstance,
  GetProp,
  Image,
  Input,
  InputNumber,
  Upload,
  UploadFile,
  UploadProps,
  Tooltip,
} from "antd";
import { MailOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { FaRegBuilding } from "react-icons/fa";
import { MdOutlineLocalPhone, MdOutlineQrCodeScanner } from "react-icons/md";
import { SlCompass } from "react-icons/sl";
import { IoIosContact } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";
import { BsDiagram3 } from "react-icons/bs";
import { HiDevicePhoneMobile } from "react-icons/hi2";
import { TiPlusOutline } from "react-icons/ti";
import Strings from "../../../utils/localizations/Strings";
import { useState } from "react";

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

const RegisterCompanyForm = ({ form }: FormProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(Strings.empty);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  return (
    <Form form={form} name="registerCompanyForm">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="name"
            validateDebounce={1000}
            rules={[
              { required: true, message: Strings.requiredCompanyName },
              { max: 100 },
            ]}
            className="flex-1 mr-3"
          >
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={100}
                addonBefore={<FaRegBuilding />}
                placeholder={Strings.companyName}
              />
              <Tooltip title={Strings.companyNameTooltip}>
                <QuestionCircleOutlined className="ml-1.5 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
          <Form.Item
            name="rfc"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredRFC },
              { max: 13 },
              { min: 12 },
            ]}
          >
            <div className="flex items-center">
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
              <Tooltip title={Strings.companyRfcTooltip}>
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
        </div>
        <Form.Item
          name="address"
          rules={[
            { required: true, message: Strings.requiredAddress },
            { max: 200 },
          ]}
        >
          <div className="flex items-center">
            <Input
              size="large"
              addonBefore={<SlCompass />}
              placeholder={Strings.companyAddress}
            />
            <Tooltip title={Strings.companyAddressTooltip}>
              <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
            </Tooltip>
          </div>
        </Form.Item>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="contact"
            rules={[
              { required: true, message: Strings.requiredContacName },
              { max: 100 },
            ]}
            className="flex-1 mr-3"
          >
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={100}
                addonBefore={<IoIosContact />}
                placeholder={Strings.contact}
              />
              <Tooltip title={Strings.companyContactNameTooltip}>
                <QuestionCircleOutlined className="ml-1.5 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
          <Form.Item
            name="position"
            rules={[
              { required: true, message: Strings.requiredPosition },
              { max: 100 },
            ]}
            className="flex-1"
          >
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={100}
                addonBefore={<BsDiagram3 />}
                placeholder={Strings.position}
              />
              <Tooltip title={Strings.companyPositionTooltip}>
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
        </div>
        <div className="flex justify-between flex-row flex-wrap">
          <Form.Item
            name="phone"
            rules={[{ required: true, message: Strings.requiredPhone }]}
          >
            <div className="flex items-center">
              <InputNumber
                size="large"
                maxLength={10}
                addonBefore={<MdOutlineLocalPhone />}
                placeholder={Strings.phone}
              />
              <Tooltip title={Strings.companyPhoneTooltip}>
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
          <Form.Item name="extension">
            <div className="flex items-center">
              <InputNumber
                size="large"
                maxLength={5}
                addonBefore={<TiPlusOutline />}
                placeholder={Strings.extension}
              />
              <Tooltip title={Strings.companyExtensionTooltip}>
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
          <Form.Item
            name="cellular"
            rules={[{ required: true, message: Strings.requiredCellular }]}
          >
            <div className="flex items-center">
              <InputNumber
                size="large"
                maxLength={13}
                addonBefore={<HiDevicePhoneMobile />}
                placeholder={Strings.cellular}
              />
              <Tooltip title={Strings.companyCellularTooltip}>
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
        </div>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: Strings.requiredEmail },
            { type: "email", message: Strings.requiredValidEmailAddress },
            { max: 60 },
          ]}
        >
          <div className="flex items-center">
            <Input
              size="large"
              maxLength={60}
              addonBefore={<MailOutlined />}
              placeholder={Strings.email}
            />
            <Tooltip title={Strings.companyEmailTooltip}>
              <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
            </Tooltip>
          </div>
        </Form.Item>
        <Form.Item
          name="logo"
          label={<div className="flex items-center">{Strings.logo}</div>}
          getValueFromEvent={(event) => event?.fileList}
          rules={[{ required: true, message: Strings.requiredLogo }]}
          className="mt-4"
        >
          <Tooltip title={Strings.companyLogoTooltip}>
            <QuestionCircleOutlined className="mb-2 text-blue-500 text-xs" />
          </Tooltip>
          <div className="flex items-center">
            <Upload
              maxCount={1}
              accept="image/*"
              listType="picture-card"
              onPreview={handleOnPreview}
              onChange={handleChange}
              fileList={fileList}
            >
              <button className="border-0 bg-none" type="button">
                <PlusOutlined />
                <div className="mt-2">Upload</div>
              </button>
            </Upload>
          </div>
        </Form.Item>
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
      </div>
    </Form>
  );
};
export default RegisterCompanyForm;
