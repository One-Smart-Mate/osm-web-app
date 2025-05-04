import React from "react";
import { Upload, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import Strings from "../../../utils/localizations/Strings";

const { Dragger } = Upload;

interface OplMediaUploaderProps {
  fileList: UploadFile[];
  fileType: 'imagen' | 'video' | 'pdf';
  uploadLoading: boolean;
  onFileChange: UploadProps['onChange'];
  onPreview: (file: UploadFile) => void;
  onUpload: () => void;
}

const OplMediaUploader: React.FC<OplMediaUploaderProps> = ({
  fileList,
  fileType,
  uploadLoading,
  onFileChange,
  onPreview,
  onUpload,
}) => {
  // Configure file acceptance based on type
  const getAcceptType = () => {
    switch (fileType) {
      case 'imagen':
        return "image/*";
      case 'video':
        return "video/*";
      case 'pdf':
        return ".pdf";
      default:
        return "";
    }
  };

  // Configure text based on type
  const getUploadText = () => {
    switch (fileType) {
      case 'imagen':
        return {
          title: Strings.oplMediaImageTitle,
          hint: Strings.oplMediaImageHint,
          button: Strings.oplMediaImageButton
        };
      case 'video':
        return {
          title: Strings.oplMediaVideoTitle,
          hint: Strings.oplMediaVideoHint,
          button: Strings.oplMediaVideoButton
        };
      case 'pdf':
        return {
          title: Strings.oplMediaPdfTitle,
          hint: Strings.oplMediaPdfHint,
          button: Strings.oplMediaPdfButton
        };
      default:
        return {
          title: Strings.oplMediaDefaultTitle,
          hint: Strings.oplMediaDefaultHint,
          button: Strings.oplMediaDefaultButton
        };
    }
  };

  const uploadText = getUploadText();

  return (
    <div>
      <Dragger
        name="file"
        multiple={false}
        fileList={fileList}
        accept={getAcceptType()}
        onChange={onFileChange}
        onPreview={onPreview}
        beforeUpload={() => false}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{uploadText.title}</p>
        <p className="ant-upload-hint">{uploadText.hint}</p>
      </Dragger>
      <Button
        type="primary"
        onClick={onUpload}
        disabled={fileList.length === 0}
        loading={uploadLoading}
        style={{ marginTop: 16 }}
      >
        {uploadText.button}
      </Button>
    </div>
  );
};

export default OplMediaUploader;
