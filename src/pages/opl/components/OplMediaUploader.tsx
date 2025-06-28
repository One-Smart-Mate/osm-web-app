import React, { useState } from "react";
import { Upload, Button, Image, Popconfirm, Tooltip, Space } from "antd";
import { InboxOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
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
  onRemoveExistingFile?: (file: UploadFile) => void; // For deleting files already on server
  isDeletingExistingFile?: boolean; // To disable remove button during API call
}

const OplMediaUploader: React.FC<OplMediaUploaderProps> = ({
  fileList,
  fileType,
  uploadLoading,
  onFileChange,
  onPreview,
  onUpload,
  onCancel,
  onRemoveExistingFile,
  isDeletingExistingFile,
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
        itemRender={(originNode: React.ReactElement<any>, file, _currFileList, actions) => {
          // Only show remove button for files that are already uploaded (e.g., have a URL)
          // and if the onRemoveExistingFile callback is provided.
          const isExistingFile = !!file.url && onRemoveExistingFile;

          return (
            <div 
              className="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-text"
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '8px',
                // Prevent image previews from showing the default list item here
                ...(fileType === 'imagen' && fileList.length > 0 && fileList[0].uid === file.uid && { display: 'none' })
              }}
            >
              <div className="ant-upload-list-item-info" onClick={() => handlePreview(file)} style={{cursor: 'pointer'}}>
                {originNode.props.children[0]} {/* Icon */}
                <span className="ant-upload-list-item-name" title={file.name}>{file.name}</span>
              </div>
              <Space>
                {isExistingFile && (
                  <Popconfirm
                    title={Strings.removeFileConfirm}
                    onConfirm={() => onRemoveExistingFile(file)}
                    okText={Strings.yes}
                    cancelText={Strings.no}
                    disabled={isDeletingExistingFile}
                  >
                    <Tooltip title={Strings.removeFile}>
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        loading={isDeletingExistingFile} 
                        disabled={isDeletingExistingFile}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
                {!isExistingFile && file.status !== 'uploading' && (
                   // Default Ant Design remove button for newly added files (not yet uploaded to server)
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={actions.remove} 
                  />
                )}
              </Space>
            </div>
          );
        }}
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
