import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Modal,
  Table,
  Input,
  Button,
  Spin,
  Badge,
  Image,
  Form,
  notification,
  Card,
  Typography,
  Space,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  FileImageOutlined,
  PlusOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  FileOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useGetOplMstrAllMutation } from "../../../services/cilt/oplMstrService";
import { useGetOplDetailsByOplMutation } from "../../../services/cilt/oplDetailsService";
import { useCreateOplMstrMutation } from "../../../services/cilt/oplMstrService";
import { useCreateOplDetailMutation } from "../../../services/cilt/oplDetailsService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import {
  OplDetail,
  CreateOplDetailsDTO,
} from "../../../data/cilt/oplDetails/oplDetails";
import { Responsible } from "../../../data/user/user";
import type { UploadFile } from "antd";
import type { ColumnsType } from "antd/es/table";
import OplForm from "../../opl/components/OplForm";
import OplMediaUploader from "../../opl/components/OplMediaUploader";
import OplTextForm from "../../opl/components/OplTextForm";
import { handleUploadToFirebaseStorage, FIREBASE_OPL_DIRECTORY } from "../../../config/firebaseUpload";
import Strings from "../../../utils/localizations/Strings";

interface OplSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (opl: OplMstr) => void;
}

const OplSelectionModal: React.FC<OplSelectionModalProps> = ({
  isVisible,
  onClose,
  onSelect,
}) => {
  const location = useLocation();
  const currentSiteId = location.state?.siteId || null;
  const [getOplMstrAll] = useGetOplMstrAllMutation();
  const [getOplDetailsByOpl] = useGetOplDetailsByOplMutation();
  const [createOplMstr] = useCreateOplMstrMutation();
  const [createOplDetail] = useCreateOplDetailMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();

  const [opls, setOpls] = useState<OplMstr[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [currentOplDetails, setCurrentOplDetails] = useState<OplDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [createOplModalVisible, setCreateOplModalVisible] = useState(false);
  const [oplForm] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentOpl, setCurrentOpl] = useState<OplMstr | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState("1");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [createdOplId, setCreatedOplId] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchOpls();
      fetchResponsibles();
    }
  }, [isVisible]);

  const fetchOpls = async () => {
    setLoading(true);
    try {
      const response = await getOplMstrAll().unwrap();
      setOpls(response || []);
    } catch (error) {
      console.error("Error fetching OPLs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponsibles = async () => {
    setLoadingUsers(true);
    try {
      const siteId = 1;
      const response = await getSiteResponsibles(String(siteId)).unwrap();
      setResponsibles(response || []);
    } catch (error) {
      console.error("Error fetching responsibles:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchOplDetails = async (oplId: number) => {
    try {
      const details = await getOplDetailsByOpl(String(oplId)).unwrap();

      if (details && Array.isArray(details)) {
        const sortedDetails = [...details].sort(
          (a: OplDetail, b: OplDetail) => a.order - b.order
        );
        setCurrentOplDetails(sortedDetails);
      } else {
        setCurrentOplDetails([]);
      }
    } catch (error) {
      console.error("Error al obtener detalles del OPL:", error);
      notification.error({
        message: Strings.oplSelectionModalErrorDetail,
        description: Strings.oplSelectionModalErrorDescription,
      });
      setCurrentOplDetails([]);
    }
  };

  const handleSelect = (record: OplMstr) => {
    onSelect(record);
    onClose();
  };

  const handleViewMedia = async (oplId: number) => {
    setLoadingDetails(true);
    try {
      const details = await getOplDetailsByOpl(String(oplId)).unwrap();
      setCurrentOplDetails(details || []);
      setMediaModalVisible(true);
    } catch (error) {
      console.error("Error fetching OPL details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateOpl = async () => {
    try {
      setSubmitting(true);
      const values = await oplForm.validateFields();

      const creator = values.creatorId
        ? responsibles.find(
            (user: Responsible) => String(user.id) === String(values.creatorId)
          )
        : null;
      const reviewer = values.reviewerId
        ? responsibles.find(
            (user: Responsible) => String(user.id) === String(values.reviewerId)
          )
        : null;

      // Usar el siteId de la ubicación actual o del formulario
      const siteIdToUse = values.siteId ? Number(values.siteId) : (currentSiteId ? Number(currentSiteId) : null);
      
      const createPayload = {
        title: values.title,
        objetive: values.objetive || "", // Provide empty string as default
        creatorId: values.creatorId ? Number(values.creatorId) : undefined, // Must use undefined to match the DTO type
        creatorName: creator?.name || "", // Provide empty string as default
        reviewerId: values.reviewerId ? Number(values.reviewerId) : undefined, // Must use undefined to match the DTO type
        reviewerName: reviewer?.name || "", // Provide empty string as default
        oplType: values.oplType || "opl", // Default to 'opl'
        createdAt: new Date().toISOString(),
        siteId: siteIdToUse, // Usar el siteId obtenido
      };
      
      console.log("Creating OPL with payload:", createPayload);

      const response = await createOplMstr(createPayload).unwrap();

      notification.success({
        message: Strings.oplSelectionModalSuccessOpl,
        description: Strings.oplSelectionModalSuccessDescription,
      });

      setCreatedOplId(response.id);
      setCurrentOpl(response);
      setCreateOplModalVisible(false);
      oplForm.resetFields();

      setDetailsModalVisible(true);
      setActiveDetailTab("1");
      setFileList([]);
      setCurrentOplDetails([]);

      await fetchOpls();
    } catch (error) {
      console.error("Error creating OPL:", error);
      notification.error({
        message: Strings.oplSelectionModalErrorOpl,
        description: Strings.oplSelectionModalErrorDescription,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveDetailTab(key);
  };

  const handleFileChange = (info: any) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    setFileList(fileList);
    
    // If file is selected and it's not a text file, trigger upload automatically
    if (fileList.length > 0 && activeDetailTab !== "2") {
      const fileType = activeDetailTab === "3" ? "imagen" : 
                      activeDetailTab === "4" ? "video" : 
                      activeDetailTab === "5" ? "pdf" : "";
      
      if (fileType && !uploadLoading) {
        handleAddMedia(fileType as "imagen" | "video" | "pdf");
      }
    }
  };

  const handlePreview = (file: any) => {
    if (file.url) {
      window.open(file.url);
    }
  };

  const handleAddText = async (values: any) => {
    handleCreateOplDetail(values, "texto");
  };

  const handleAddMedia = async (type: "imagen" | "video" | "pdf") => {
    handleCreateOplDetail({}, type);
  };

  const handleCreateOplDetail = async (
    values: any,
    type: "video" | "texto" | "imagen" | "pdf"
  ) => {
    try {
      setUploadLoading(true);
      
      if (!currentOpl?.id) {
        throw new Error("No se ha seleccionado un OPL");
      }
      
      // Manejar texto y media de manera separada
      if (type === "texto") {
        // Para detalles de texto
        const newDetail: CreateOplDetailsDTO = {
          siteId: Number(currentOpl.siteId || 0),
          oplId: Number(currentOpl.id),
          order: currentOplDetails.length + 1,
          type: "texto",
          text: values.text || "",
          mediaUrl: "",
          createdAt: new Date().toISOString(),
        };
        
        console.log("Creating text detail:", newDetail);
        const response = await createOplDetail(newDetail).unwrap();
        
        if (response) {
          notification.success({
            message: Strings.oplSelectionModalSuccessDetail,
            description: Strings.oplSelectionModalSuccessDescription,
          });
          
          detailForm.resetFields();
          setActiveDetailTab("1"); // Volver a la lista
          await fetchOplDetails(currentOpl.id);
        }
      } else {
        if (fileList.length === 0) {
          notification.error({
            message: "Error",
            description: "No se ha seleccionado ningún archivo",
          });
          setUploadLoading(false);
          return;
        }
        
        const file = fileList[0];
        if (!file || !file.originFileObj) {
          notification.error({
            message: "Error",
            description: "El archivo seleccionado no es válido",
          });
          setUploadLoading(false);
          return;
        }
        
        // Determinar la extensión del archivo
        let fileExtension = "jpg";
        if (type === "video") {
          fileExtension = "mp4";
        } else if (type === "pdf") {
          fileExtension = "pdf";
        } else if (type === "imagen") {
          fileExtension = file.name.split(".").pop() || "jpg";
        }
        
        const uploadFile = {
          name: file.name,
          originFileObj: file.originFileObj as File,
        };
        
        
        console.log("Uploading file to Firebase...");
        
        const sitePath = currentOpl && currentOpl.siteId ? `site_${currentOpl.siteId}/opl` : `${FIREBASE_OPL_DIRECTORY}/${currentOpl.id}`;
        const url = await handleUploadToFirebaseStorage(
          sitePath,
          uploadFile,
          fileExtension
        );
        console.log("File uploaded successfully, URL:", url);
        
        const newDetail: CreateOplDetailsDTO = {
          siteId: Number(currentOpl.siteId || 0),
          oplId: Number(currentOpl.id),
          order: currentOplDetails.length + 1,
          type,
          text: "",
          mediaUrl: url,
          createdAt: new Date().toISOString(),
        };
        
        console.log("Creating media detail:", newDetail);
        const response = await createOplDetail(newDetail).unwrap();
        
        if (response) {
          notification.success({
            message: Strings.oplSelectionModalSuccessDetail,
            description: Strings.oplSelectionModalSuccessDescription,
          });
          
          setFileList([]);
          setActiveDetailTab("1"); // Volver a la lista
          await fetchOplDetails(currentOpl.id);
        }
      }
    } catch (error) {
      console.error("Error al crear detalle de OPL:", error);
      notification.error({
        message: Strings.oplSelectionModalErrorDetail,
        description: Strings.oplSelectionModalErrorDescription,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDetailsCancel = () => {
    setDetailsModalVisible(false);

    if (createdOplId && currentOpl) {
      onSelect(currentOpl);
      onClose();
      setCreatedOplId(null);
      setCurrentOpl(null);
    }
  };

  const filteredOpls = opls.filter((opl) =>
    opl.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<OplMstr> = [
    {
      title: Strings.oplSelectionModalTitleColumn,
      dataIndex: "title",
      key: "title",
      sorter: (a: OplMstr, b: OplMstr) => a.title.localeCompare(b.title),
      ellipsis: true,
      width: "50%",
    },
    {
      title: Strings.oplSelectionModalTypeColumn,
      dataIndex: "oplType",
      key: "oplType",
      render: (type: string) => (
        <Badge
          color={type === "opl" ? "blue" : "green"}
          text={type === "opl" ? "OPL" : "SOP"}
        />
      ),
      filters: [
        { text: "OPL", value: "opl" },
        { text: "SOP", value: "sop" },
      ],
      onFilter: (value: any, record: OplMstr) => record.oplType === value,
      width: "15%",
    },
    {
      title: Strings.oplSelectionModalActionsColumn,
      key: "actions",
      width: "35%",
      render: (_, record: OplMstr) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            onClick={() => handleSelect(record)}
            style={{ cursor: "pointer" }}
          >
            {Strings.oplSelectionModalSelectButton}
          </Button>
          <Button
            type="default"
            size="small"
            icon={<FileImageOutlined />}
            onClick={() => handleViewMedia(record.id)}
            style={{ cursor: "pointer" }}
          >
            {Strings.oplSelectionModalMultimediaButton}
          </Button>
        </Space>
      ),
    },
  ];

  const renderMediaContent = (detail: OplDetail) => {
    if (!detail.mediaUrl && !detail.text) return null;

    switch (detail.type) {
      case "imagen":
        return (
          <Card
            style={{
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
            }}
            title={
              <Space>
                <PictureOutlined
                  style={{ color: "#1890ff", fontSize: "18px" }}
                />{" "}
                <Typography.Text strong>
                  {Strings.oplSelectionModalImageTitle}
                </Typography.Text>
              </Space>
            }
            bordered={true}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Image
                src={detail.mediaUrl || ""}
                alt={Strings.oplSelectionModalImageAlt}
                style={{
                  width: "400px",
                  height: "300px",
                  objectFit: "contain",
                  maxWidth: "100%",
                }}
                fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
              />
            </div>
            <Typography.Text
              style={{
                marginTop: 8,
                display: "block",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {getFileName(detail.mediaUrl)}
            </Typography.Text>
          </Card>
        );
      case "video":
        return (
          <Card
            style={{
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            title={
              <Space>
                <VideoCameraOutlined
                  style={{ color: "#1890ff", fontSize: "18px" }}
                />{" "}
                <Typography.Text strong>Video</Typography.Text>
              </Space>
            }
            bordered={true}
          >
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <video
                src={detail.mediaUrl || ""}
                controls
                style={{
                  width: '400px',
                  maxWidth: '100%',
                  height: '300px',
                  objectFit: 'contain'
                }}
              />
              <Typography.Text style={{ marginTop: 8, display: "block", fontWeight: "bold", textAlign: "center" }}>
                {getFileName(detail.mediaUrl)}
              </Typography.Text>
            </div>
          </Card>
        );
      case "pdf":
        return (
          <Card
            style={{
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            title={
              <Space>
                <FilePdfOutlined
                  style={{ color: "#1890ff", fontSize: "18px" }}
                />{" "}
                <Typography.Text strong>PDF</Typography.Text>
              </Space>
            }
            bordered={true}
          >
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '400px', maxWidth: '100%', textAlign: 'center' }}>
                <Button
                  type="primary"
                  onClick={() =>
                    detail.mediaUrl && window.open(detail.mediaUrl, "_blank")
                  }
                  icon={<FileOutlined />}
                  style={{ marginBottom: '8px' }}
                >
                  Ver PDF
                </Button>
                <Typography.Text style={{ display: "block", fontWeight: "bold", textAlign: "center" }}>
                  {getFileName(detail.mediaUrl)}
                </Typography.Text>
              </div>
            </div>
          </Card>
        );
      case "texto":
        return (
          <Card
            style={{
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            title={
              <Space>
                <FileTextOutlined
                  style={{ color: "#1890ff", fontSize: "18px" }}
                />{" "}
                <Typography.Text strong>Texto</Typography.Text>
              </Space>
            }
            bordered={true}
          >
            <Typography.Paragraph style={{ maxWidth: '400px', margin: '0 auto', whiteSpace: 'pre-wrap' }}>
              {detail.text}
            </Typography.Paragraph>
          </Card>
        );
      default:
        return null;
    }
  };

  // Función mejorada para obtener el nombre del archivo de una URL
  const getFileName = (url: string | null | undefined): string => {
    if (!url) return "Sin archivo";
    
    try {
      // Decode URL components
      const decodedUrl = decodeURIComponent(url);
      
      // Extract filename from URL
      const parts = decodedUrl.split('/');
      let fullName = parts[parts.length - 1];
      
      // Remove query parameters if any
      fullName = fullName.split('?')[0];
      
      // Remove any additional parameters after underscore
      if (fullName.includes('_')) {
        const nameParts = fullName.split('_');
        // If it's a UUID pattern after underscore, remove it
        if (nameParts.length > 1 && nameParts[1].match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)) {
          fullName = nameParts[0];
        }
      }
      
      // If the filename still has a path pattern like "images/opl/filename.ext", extract just the filename
      if (fullName.includes('/')) {
        const pathParts = fullName.split('/');
        fullName = pathParts[pathParts.length - 1];
      }
      
      // If filename still has encoded characters like %20, try to decode again
      if (fullName.includes('%')) {
        try {
          fullName = decodeURIComponent(fullName);
        } catch (e) {
          // If decoding fails, keep the current name
        }
      }
      
      return fullName;
    } catch (e) {
      // If any error occurs during processing, try a simpler approach
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      
      // Return just the last part of the path
      return fileName;
    }
  };

  return (
    <>
      <Modal
        title="Seleccionar OPL/SOP"
        open={isVisible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ maxWidth: "95vw", top: 20 }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
        getContainer={() => document.body}
      >
        <div
          className="mb-4"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Buscar por título"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: "calc(100% - 120px)" }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOplModalVisible(true)}
            style={{ cursor: "pointer" }}
          >
            Crear OPL
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredOpls}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Modal>

      <Modal
        title={Strings.oplSelectionModalMultimediaTitle}
        open={mediaModalVisible}
        onCancel={() => setMediaModalVisible(false)}
        footer={null}
        width={800}
      >
        <Spin spinning={loadingDetails}>
          {currentOplDetails.length === 0 ? (
            <p>{Strings.oplSelectionModalNoContent}</p>
          ) : (
            <div style={{ maxHeight: "500px", overflow: "auto" }}>
              {currentOplDetails.map((detail, index) => (
                <div
                  key={detail.id || index}
                  style={{
                    marginBottom: "20px",
                    padding: "10px",
                    border: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ width: '100%', maxWidth: '600px' }}>
                    {renderMediaContent(detail)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </Modal>

      <Modal
        title={Strings.oplSelectionModalCreateTitle}
        open={createOplModalVisible}
        onCancel={() => setCreateOplModalVisible(false)}
        footer={null}
        width={700}
      >
        <Spin spinning={submitting}>
          <OplForm
            form={oplForm}
            isViewMode={false}
            loadingUsers={loadingUsers}
            responsibles={responsibles}
            onSubmit={handleCreateOpl}
          />
        </Spin>
      </Modal>

      <Modal
        title={`Detalles del OPL: ${currentOpl?.title || ''}`}
        open={detailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={null}
        width={800}
      >
        <Tabs
          activeKey={activeDetailTab}
          onChange={handleTabChange}
          items={[
            {
              key: "1",
              label: "Lista de contenido",
              children: (
                <div style={{ padding: '0 16px' }}>
                  <Typography.Title level={5} style={{ marginBottom: 24 }}>{Strings.oplDetailsContentPreview}</Typography.Title>
                  {currentOplDetails.length === 0 ? (
                    <Card>
                      <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Typography.Paragraph>{Strings.oplDetailsNoContent}</Typography.Paragraph>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => handleTabChange("2")}
                        >
                          {Strings.oplDetailsAddContent}
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div>
                      {currentOplDetails.map((detail) => (
                        <div key={detail.id} style={{ marginBottom: '20px' }}>
                          {renderMediaContent(detail)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "2",
              label: "Agregar texto",
              children: (
                <Card title={<Typography.Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddText}</Typography.Text>} bordered={false}>
                  <OplTextForm 
                    form={detailForm} 
                    onSubmit={(values: any) => handleAddText(values)} 
                  />
                </Card>
              ),
            },
            {
              key: "3",
              label: "Agregar imagen",
              children: (
                <Card title={<Typography.Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddImage}</Typography.Text>} bordered={false}>
                  <OplMediaUploader
                    fileList={fileList}
                    fileType="imagen"
                    uploadLoading={uploadLoading}
                    onFileChange={handleFileChange}
                    onPreview={handlePreview}
                    onUpload={() => handleAddMedia("imagen")}
                    onCancel={() => setFileList([])}
                  />
                </Card>
              ),
            },
            {
              key: "4",
              label: "Agregar video",
              children: (
                <Card title={<Typography.Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddVideo}</Typography.Text>} bordered={false}>
                  <OplMediaUploader
                    fileList={fileList}
                    fileType="video"
                    uploadLoading={uploadLoading}
                    onFileChange={handleFileChange}
                    onPreview={handlePreview}
                    onUpload={() => handleAddMedia("video")}
                    onCancel={() => setFileList([])}
                  />
                </Card>
              ),
            },
            {
              key: "5",
              label: "Agregar PDF",
              children: (
                <Card title={<Typography.Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddPdf}</Typography.Text>} bordered={false}>
                  <OplMediaUploader
                    fileList={fileList}
                    fileType="pdf"
                    uploadLoading={uploadLoading}
                    onFileChange={handleFileChange}
                    onPreview={handlePreview}
                    onUpload={() => handleAddMedia("pdf")}
                    onCancel={() => setFileList([])}
                  />
                </Card>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default OplSelectionModal;
