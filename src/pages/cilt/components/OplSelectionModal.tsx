import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  FileImageOutlined,
  PlusOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
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
import OplDetailsModal from "../../opl/components/OplDetailsModal";
import { storage } from "../../../config/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
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

      const createPayload = {
        title: values.title,
        objetive: values.objetive,
        creatorId: values.creatorId ? Number(values.creatorId) : undefined,
        creatorName: creator?.name || undefined,
        reviewerId: values.reviewerId ? Number(values.reviewerId) : undefined,
        reviewerName: reviewer?.name || undefined,
        oplType: values.oplType || "opl",
        createdAt: new Date().toISOString(),
      };

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

      let mediaUrl = "";

      if (type !== "texto" && fileList.length > 0) {
        const file = fileList[0].originFileObj;
        if (file) {
          const storageRef = ref(
            storage,
            `oplDetails/${currentOpl?.id}/${Date.now()}_${file.name}`
          );

          const uploadTask = uploadBytesResumable(storageRef, file);

          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
              },
              (error) => {
                console.error("Error al subir archivo:", error);
                reject(error);
              },
              async () => {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );
                mediaUrl = downloadURL;
                resolve();
              }
            );
          });
        }
      }

      if (!currentOpl?.id) {
        throw new Error("No se ha seleccionado un OPL");
      }
      const detailData: CreateOplDetailsDTO = {
        oplId: Number(currentOpl.id),
        type,
        text: type === "texto" ? values.text : "",
        mediaUrl,
        order: currentOplDetails.length + 1,
      };

      const response = await createOplDetail(detailData).unwrap();

      if (response) {
        notification.success({
          message: Strings.oplSelectionModalSuccessDetail,
          description: Strings.oplSelectionModalSuccessDescription,
        });

        detailForm.resetFields();
        setFileList([]);
        setActiveDetailTab("list");
        if (currentOpl) {
          fetchOplDetails(currentOpl.id);
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
            icon={<EyeOutlined />}
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
            <Image
              src={detail.mediaUrl || ""}
              alt={Strings.oplSelectionModalImageAlt}
              style={{ maxWidth: "100%" }}
              fallback="data:image/png;base64,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"
            />
            <Typography.Text
              style={{ marginTop: 8, display: "block", fontWeight: "bold" }}
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
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                onClick={() =>
                  detail.mediaUrl && window.open(detail.mediaUrl, "_blank")
                }
                icon={<PlayCircleOutlined />}
              >
                Reproducir Video
              </Button>
              <Typography.Text style={{ display: "block", fontWeight: "bold" }}>
                {getFileName(detail.mediaUrl)}
              </Typography.Text>
            </Space>
          </Card>
        );
      case "pdf":
        return (
          <Card
            style={{
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
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
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                onClick={() =>
                  detail.mediaUrl && window.open(detail.mediaUrl, "_blank")
                }
                icon={<FileOutlined />}
              >
                Ver PDF
              </Button>
              <Typography.Text style={{ display: "block", fontWeight: "bold" }}>
                {getFileName(detail.mediaUrl)}
              </Typography.Text>
            </Space>
          </Card>
        );
      case "texto":
        return (
          <Card
            style={{
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
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
            <Typography.Paragraph>{detail.text}</Typography.Paragraph>
          </Card>
        );
      default:
        return null;
    }
  };

  // Función para obtener el nombre del archivo de una URL
  const getFileName = (url: string | null | undefined): string => {
    if (!url) return "Sin archivo";
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <>
      <Modal
        title="Seleccionar OPL/SOP"
        open={isVisible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ maxWidth: "95vw" }}
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
                  }}
                >
                  {renderMediaContent(detail)}
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

      <OplDetailsModal
        visible={detailsModalVisible}
        currentOpl={currentOpl}
        currentDetails={currentOplDetails}
        activeTab={activeDetailTab}
        fileList={fileList}
        uploadLoading={uploadLoading}
        detailForm={detailForm}
        onCancel={handleDetailsCancel}
        onTabChange={handleTabChange}
        onFileChange={handleFileChange}
        onPreview={handlePreview}
        onAddText={handleAddText}
        onAddMedia={handleAddMedia}
      />
    </>
  );
};

export default OplSelectionModal;
