import React, { useState } from "react";
import { Upload, Button, Image } from "antd";
import { InboxOutlined, EyeOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import Strings from "../../../utils/localizations/Strings";

const { Dragger } = Upload;

const validateFileType = (file: File, fileType: string): boolean => {
  if (fileType === 'imagen' && !file.type.startsWith('image/')) {
    return false;
  }
  if (fileType === 'video' && !file.type.startsWith('video/')) {
    return false;
  }
  if (fileType === 'pdf' && file.type !== 'application/pdf') {
    return false;
  }
  return true;
};

export const fileValidationCache = new Map<string, boolean>();

interface OplMediaUploaderProps {
  fileList: UploadFile[];
  fileType: 'imagen' | 'video' | 'pdf' | 'text';
  uploadLoading: boolean;
  onFileChange: UploadProps['onChange'];
  onPreview: (file: UploadFile) => void;
  onUpload: () => void;
  onCancel: () => void;
}

const OplMediaUploader: React.FC<OplMediaUploaderProps> = ({
  fileList,
  fileType,
  uploadLoading,
  onFileChange,
  onPreview,
  onUpload,
  onCancel,
}) => {
  
  const getAcceptType = () => {
    switch (fileType) {
      case 'imagen':
        return "image/*";
      case 'video':
        return "video/*";
      case 'pdf':
        return ".pdf";
      case 'text':
        return "text/*";
      default:
        return "";
    }
  };

  
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

  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  const handlePreview = (file: UploadFile) => {
    if (fileType === 'imagen' && file.originFileObj) {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setPreviewVisible(true);
      };
    } else {
      onPreview(file);
    }
  };

  return (
    <div>
      {fileType === 'imagen' && fileList.length > 0 && fileList[0].originFileObj && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div 
            style={{ 
              position: 'relative', 
              display: 'inline-block',
              maxWidth: '200px',
              cursor: 'pointer'
            }}
            onClick={() => handlePreview(fileList[0])}
          >
            <img 
              src={URL.createObjectURL(fileList[0].originFileObj)} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px', 
                borderRadius: '4px' 
              }} 
            />
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(0,0,0,0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s',
              borderRadius: '4px'
            }}>
              <EyeOutlined style={{ fontSize: 24, color: 'white' }} />
            </div>
          </div>
        </div>
      )}

      <Dragger
        name="file"
        multiple={false}
        fileList={fileList}
        accept={getAcceptType()}
        onChange={onFileChange}
        onPreview={handlePreview}
        beforeUpload={(file) => {
          const isValidType = validateFileType(file, fileType);
          fileValidationCache.set(file.uid, isValidType);
          return false; 
        }}
        style={{ marginBottom: fileType === 'text' ? 16 : 0 }}
        showUploadList={fileType !== 'imagen' || fileList.length === 0}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{uploadText.title}</p>
        <p className="ant-upload-hint">{uploadText.hint}</p>
      </Dragger>
      {/* Show upload button for all file types */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button
          type="default"
          onClick={onCancel}
        >
          {Strings.close}
        </Button>
        <Button
          type="primary"
          onClick={onUpload}
          disabled={fileList.length === 0} 
          loading={uploadLoading}
        >
          {uploadText.button}
        </Button>
      </div>

      {fileType === 'imagen' && (
        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            onVisibleChange: (visible) => setPreviewVisible(visible),
            src: previewImage,
          }}
        />
      )}
    </div>
  );
};

export default OplMediaUploader;
