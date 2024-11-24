import { useEffect, useState } from "react";
import { useAppSelector } from "../../../core/store";
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
import Strings from "../../../utils/localizations/Strings";
import {
  MailOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FaRegBuilding } from "react-icons/fa";
import { MdOutlineLocalPhone, MdOutlineQrCodeScanner } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { BsDiagram3 } from "react-icons/bs";
import { TiPlusOutline } from "react-icons/ti";
import { HiDevicePhoneMobile } from "react-icons/hi2";
import { SlCompass } from "react-icons/sl";
import { Company } from "../../../data/company/company";
import { selectCurrentRowData } from "../../../core/genericReducer";

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

const UpdateCompanyForm = ({ form }: FormProps) => {
  const rowData = useAppSelector(selectCurrentRowData) as unknown as Company;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(Strings.empty);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    form.setFieldsValue({
      ...rowData,
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
            className="flex-1 mr-2"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<FaRegBuilding />}
              placeholder={Strings.companyName}
            />
          </Form.Item>
          <Tooltip title={Strings.companyNameTooltip}>
            <QuestionCircleOutlined className="h-9 mr-2 text-blue-500 text-sm" />
          </Tooltip>
          <Form.Item
            name="rfc"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredRFC },
              { min: 12 },
              { max: 13 },
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
          <Tooltip title={Strings.rfcTooltip}>
            <QuestionCircleOutlined className="ml-2 h-9 text-blue-500 text-sm" />
          </Tooltip>
        </div>
        <div className="flex items-center w-full">
          <Form.Item
            name="address"
            rules={[
              { required: true, message: Strings.requiredAddress },
              { max: 200 },
            ]}
            className="flex-grow"
          >
            <Input
              size="large"
              addonBefore={<SlCompass />}
              placeholder={Strings.companyAddress}
            />
          </Form.Item>
          <Tooltip title={Strings.addressTooltip}>
            <QuestionCircleOutlined className="mb-6 ml-2 text-blue-500 text-sm" />
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
          <Tooltip title={Strings.contactNameTooltip}>
            <QuestionCircleOutlined className="h-9 ml-1 mr-1.5 text-blue-500 text-sm" />
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
          <Tooltip title={Strings.positionTooltip}>
            <QuestionCircleOutlined className="h-9 ml-1.5  text-blue-500 text-sm" />
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
          <Tooltip title={Strings.phoneTooltip}>
            <QuestionCircleOutlined className="h-9 ml-1.5 mr-1.5  text-blue-500 text-sm" />
          </Tooltip>
          <Form.Item name="extension">
            <InputNumber
              size="large"
              maxLength={5}
              addonBefore={<TiPlusOutline />}
              placeholder={Strings.extension}
            />
          </Form.Item>
          <Tooltip title={Strings.extensionTooltip}>
            <QuestionCircleOutlined className="h-9 ml-1.5 mr-1.5  text-blue-500 text-sm" />
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
          <Tooltip title={Strings.cellularTooltip}>
            <QuestionCircleOutlined className="h-9 ml-1.5  text-blue-500 text-sm" />
          </Tooltip>
        </div>
        <div className="flex items-center w-full">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: Strings.requiredEmail },
              { type: "email", message: Strings.requiredValidEmailAddress },
              { max: 60 },
            ]}
            className="flex-grow"
          >
            <Input
              size="large"
              maxLength={60}
              addonBefore={<MailOutlined />}
              placeholder={Strings.email}
            />
          </Form.Item>
          <Tooltip title={Strings.emailTooltip}>
            <QuestionCircleOutlined className="h-9 mb-7 ml-2 text-blue-500 text-sm" />
          </Tooltip>
        </div>
        <div className="flex items-center w-full">
          <Form.Item
            name="logo"
            label={Strings.logo}
            getValueFromEvent={(event) => event?.fileList}
            rules={[{ required: true, message: Strings.requiredLogo }]}
          >
            <div className="flex items-center">
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
              <Tooltip title={Strings.logoTooltip}>
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
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
      </div>
    </Form>
  );
};
export default UpdateCompanyForm;
