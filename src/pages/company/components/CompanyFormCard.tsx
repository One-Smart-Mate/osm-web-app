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
} from "antd";
import {
  BsBuilding,
  BsCloudUpload,
  BsDiagram3,
  BsFiles,
  BsMailbox,
  BsPerson,
  BsPhone,
  BsPinMap,
  BsTelephone,
  BsTelephoneOutbound,
} from "react-icons/bs";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import Strings from "../../../utils/localizations/Strings";
import {
  FIREBASE_COMPANY_DIRECTORY,
  FIREBASE_IMAGE_FILE_TYPE,
  handleUploadToFirebaseStorage,
} from "../../../config/firebaseUpload";
import { formatCompanyName } from "../../../utils/Extensions";
import { GetProp } from "antd/lib";
import { Company } from "../../../data/company/company";

interface CompanyFormCardProps {
  form: FormInstance;
  initialValues?: Company;
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

const CompanyFormCard: React.FC<CompanyFormCardProps> = ({
  form,
  initialValues,
  onSubmit,
  onSuccessUpload,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(Strings.empty);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        logo: initialValues?.logo,
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
      if(onSuccessUpload) {
        onSuccessUpload(initialValues.logo);
      }
    }
  }, [initialValues, form]);

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
    const { file, onSuccess, onError } = options;
    try {
      const companyName = form.getFieldValue("name");
      const fileName =
        companyName && companyName.trim() !== "" ? companyName : file.name;
      const uploadedUrl = await handleUploadToFirebaseStorage(
        FIREBASE_COMPANY_DIRECTORY,
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
            className="flex-1"
            label={Strings.companyName}
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
            label={Strings.rfc}
            validateFirst
            rules={[
              { required: true, message: Strings.requiredRFC },
              { max: 13 },
              { min: 12 },
            ]}
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
          <AnatomyTooltip title={Strings.companyRfcTooltip} />
        </div>

        <div className="flex w-full">
          <Form.Item
            name="address"
            rules={[
              { required: true, message: Strings.requiredAddress },
              { max: 200 },
            ]}
            className="flex-1"
            label={Strings.companyAddress}
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
            rules={[
              { required: true, message: Strings.requiredContacName },
              { max: 100 },
            ]}
            className="flex-1"
            label={Strings.contact}
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
            rules={[
              { required: true, message: Strings.requiredPosition },
              { max: 100 },
            ]}
            className="flex-1"
            label={Strings.position}
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
            rules={[
              { required: true, message: Strings.requiredEmail },
              { type: "email", message: Strings.requiredValidEmailAddress },
              { max: 60 },
            ]}
            className="flex-1"
            label={Strings.email}
          >
            <Input
              maxLength={60}
              addonBefore={<BsMailbox />}
              placeholder={Strings.email}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.companyEmailTooltip} />
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
      </div>
    </Form>
  );
};

export default CompanyFormCard;
