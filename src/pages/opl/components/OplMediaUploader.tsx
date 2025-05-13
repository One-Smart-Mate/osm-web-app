import React from "react";
import { Upload, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import  Strings  from "../../../utils/localizations/Strings";

const { Dragger } = Upload;

// Función para validar el tipo de archivo según el tipo seleccionado
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

// Almacena el resultado de la validación para cada archivo
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
  // Ya no hacemos auto-upload para evitar problemas con la validación
  // Los archivos se suben manualmente desde el componente padre
  
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

  return (
    <div>
      <Dragger
        name="file"
        multiple={false}
        fileList={fileList}
        accept={getAcceptType()}
        onChange={onFileChange}
        onPreview={onPreview}
        beforeUpload={(file) => {
          // Validación básica del tipo de archivo pero sin mostrar errores todavía
          // Guardamos el resultado en un Map para usarlo después
          const isValidType = validateFileType(file, fileType);
          fileValidationCache.set(file.uid, isValidType);
          return false; // Siempre devolver false para manejar manualmente la subida
        }}
        style={{ marginBottom: fileType === 'text' ? 16 : 0 }}
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
    </div>
  );
};

export default OplMediaUploader;
