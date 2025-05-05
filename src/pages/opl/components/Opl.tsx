import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Button, Spin, Form, notification, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetOplMstrAllMutation,
  useCreateOplMstrMutation,
  useUpdateOplMstrMutation,
} from "../../../services/cilt/oplMstrService";
import {
  useGetOplDetailsByOplMutation,
  useCreateOplDetailMutation,
} from "../../../services/cilt/oplDetailsService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { OplMstr, CreateOplMstrDTO } from "../../../data/cilt/oplMstr/oplMstr";
import {
  OplDetail,
  CreateOplDetailsDTO,
} from "../../../data/cilt/oplDetails/oplDetails";
import { Responsible } from "../../../data/user/user";
import {
  handleUploadToFirebaseStorage,
  FIREBASE_OPL_DIRECTORY,
} from "../../../config/firebaseUpload";
import type { UploadFile, UploadProps } from "antd";
import OplTable from "./OplTable";
import OplForm from "./OplForm";
import OplDetailsModal from "./OplDetailsModal";
import OplViewModal from "./OplViewModal";
import Strings from "../../../utils/localizations/Strings";
import SearchBar from "../../../components/common/SearchBar";

const { Title } = Typography;

const Opl = (): React.ReactElement => {
  const location = useLocation();
  const siteId = location.state?.siteId || "";
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();

  const [oplList, setOplList] = useState<OplMstr[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentOpl, setCurrentOpl] = useState<OplMstr | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewDetails, setViewDetails] = useState<OplDetail[]>([]);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<OplDetail[]>([]);
  const [activeDetailTab, setActiveDetailTab] = useState("1");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [getOplMstrAll] = useGetOplMstrAllMutation();
  const [createOplMstr] = useCreateOplMstrMutation();
  const [updateOplMstr] = useUpdateOplMstrMutation();
  const [getOplDetailsByOpl] = useGetOplDetailsByOplMutation();
  const [createOplDetail] = useCreateOplDetailMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();

  useEffect(() => {
    fetchOpls();
    if (siteId) {
      fetchResponsibles();
    }
  }, [siteId]);

  const fetchOpls = async () => {
    setLoading(true);
    try {
      const response = await getOplMstrAll().unwrap();
      
      if (searchTerm) {
        const filtered = response.filter(opl => 
          opl.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setOplList(filtered);
      } else {
        setOplList(response);
      }
    } catch (error) {
      console.error("Error fetching OPL list:", error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorLoadingList,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResponsibles = async () => {
    if (!siteId) return;

    setLoadingUsers(true);
    try {
      const response = await getSiteResponsibles(siteId).unwrap();
      setResponsibles(response || []);
    } catch (error) {
      console.error("Error fetching responsibles:", error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorLoadingUsers,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatOplForForm = (record: OplMstr) => {
    const creator = responsibles.find(
      (user: Responsible) => String(user.id) === String(record.creatorId)
    );
    const reviewer = record.reviewerId
      ? responsibles.find(
          (user: Responsible) => String(user.id) === String(record.reviewerId)
        )
      : null;

    return {
      ...record,
      creatorId: creator ? creator.id : undefined,
      reviewerId: reviewer ? reviewer.id : undefined,
      creatorName: creator ? creator.name : record.creatorName,
      reviewerName: reviewer ? reviewer.name : record.reviewerName,
      oplType: record.oplType || "opl",
    };
  };

  const showCreateModal = () => {
    setCurrentOpl(null);
    setIsViewMode(false);
    form.resetFields();

    setIsModalVisible(true);
  };

  const showEditModal = (record: OplMstr) => {
    setCurrentOpl(record);
    setIsViewMode(false);

    const formattedRecord = formatOplForForm(record);
    form.setFieldsValue(formattedRecord);

    setIsModalVisible(true);
  };

  const showViewModal = async (record: OplMstr) => {
    setCurrentOpl(record);
    setViewModalVisible(true);

    try {
      const details = await getOplDetailsByOpl(String(record.id)).unwrap();

      if (details && Array.isArray(details)) {
        const sortedDetails = [...details].sort((a, b) => a.order - b.order);
        setViewDetails(sortedDetails);
      } else {
        setViewDetails([]);
      }
    } catch (error) {
      console.error("Error fetching OPL details for view:", error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorLoadingDetails,
      });
      setViewDetails([]);
    }
  };

  const handleViewCancel = () => {
    setViewModalVisible(false);
    setViewDetails([]);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

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

      if (currentOpl) {
        const updatePayload: any = {
          id: currentOpl.id,
          title: values.title,
          objetive: values.objetive,
          creatorId: values.creatorId ? Number(values.creatorId) : undefined,
          creatorName: creator?.name || undefined,
          reviewerId: values.reviewerId ? Number(values.reviewerId) : undefined,
          reviewerName: reviewer?.name || undefined,
          oplType: values.oplType,
          updatedAt: new Date().toISOString(),
        };

        await updateOplMstr(updatePayload).unwrap();
        notification.success({
          message: "Success",
          description: Strings.oplSuccessUpdated,
        });
      } else {
        const createPayload: CreateOplMstrDTO = {
          title: values.title,
          objetive: values.objetive,
          creatorId: values.creatorId ? Number(values.creatorId) : undefined,
          creatorName: creator?.name || undefined,
          reviewerId: values.reviewerId ? Number(values.reviewerId) : undefined,
          reviewerName: reviewer?.name || undefined,
          oplType: values.oplType,
          createdAt: new Date().toISOString(),
        };

        await createOplMstr(createPayload).unwrap();
        notification.success({
          message: "Success",
          description: Strings.oplSuccessCreated,
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      await fetchOpls();
    } catch (error) {
      console.error("Error saving OPL:", error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorSaving,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const showDetailsModal = async (record: OplMstr) => {
    setCurrentOpl(record);
    setDetailsModalVisible(true);
    setActiveDetailTab("1");
    setFileList([]);

    await fetchOplDetails(String(record.id));
  };

  const handleDetailsCancel = () => {
    setDetailsModalVisible(false);
    detailForm.resetFields();
    setCurrentDetails([]);
    setFileList([]);
  };

  const handleDetailTabChange = (key: string) => {
    setActiveDetailTab(key);
    detailForm.resetFields();
    setFileList([]);
  };

  const fetchOplDetails = async (oplId: string) => {
    try {
      const details = await getOplDetailsByOpl(oplId).unwrap();

      if (details && Array.isArray(details)) {
        const sortedDetails = [...details].sort((a, b) => a.order - b.order);
        setCurrentDetails(sortedDetails);
        console.log("Details loaded:", sortedDetails);
      } else {
        console.error("No valid details received:", details);
        setCurrentDetails([]);
      }
    } catch (error) {
      console.error("Error fetching OPL details:", error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorLoadingDetails,
      });
      setCurrentDetails([]);
    }
  };

  const handleFileChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (file.url) {
      window.open(file.url);
    }
  };

  const handleAddTextDetail = async (values: any) => {
    if (!currentOpl) return;

    try {
      const newDetail: CreateOplDetailsDTO = {
        oplId: Number(currentOpl.id),
        order: currentDetails.length + 1,
        type: "texto",
        text: values.text,
        mediaUrl: "",
      };

      await createOplDetail(newDetail).unwrap();

      await fetchOplDetails(String(currentOpl.id));

      detailForm.resetFields();

      notification.success({
        message: "Success",
        description: Strings.oplSuccessTextAdded,
      });

      setActiveDetailTab("1");
    } catch (error) {
      console.error("Error adding text detail:", error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorAddingText,
      });
    }
  };

  const handleAddMediaDetail = async (type: "imagen" | "video" | "pdf") => {
    if (!currentOpl || fileList.length === 0) return;

    try {
      setUploadLoading(true);

      const file = fileList[0];
      if (!file || !file.originFileObj) {
        notification.error({
          message: "Error",
          description: Strings.oplErrorNoFileSelected,
        });
        return;
      }

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

      const url = await handleUploadToFirebaseStorage(
        FIREBASE_OPL_DIRECTORY,
        uploadFile,
        fileExtension
      );

      const newDetail: CreateOplDetailsDTO = {
        oplId: Number(currentOpl.id),
        order: currentDetails.length + 1,
        type,
        text: "",
        mediaUrl: url,
      };

      await createOplDetail(newDetail).unwrap();

      await fetchOplDetails(String(currentOpl.id));

      setFileList([]);

      notification.success({
        message: "Success",
        description: Strings.oplSuccessMediaAdded.replace(
          "{type}",
          type.charAt(0).toUpperCase() + type.slice(1)
        ),
      });

      setActiveDetailTab("1");
    } catch (error) {
      console.error(`Error adding ${type} detail:`, error);
      notification.error({
        message: "Error",
        description: Strings.oplErrorAddingMedia.replace("{type}", type),
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchOpls();
  };

  return (
    <div style={{ padding: "12px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          gap: "16px"
        }}
      >
        <div style={{ flex: 1, maxWidth: "300px" }}>
          <SearchBar 
            placeholder={Strings.oplSearchBarPlaceholder}
            onSearch={handleSearch}
          />
        </div>
        
        <Title level={3} style={{ flex: 2, margin: 0, textAlign: "center" }}>
          {Strings.oplPageManagementTitle}
        </Title>
        
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            {Strings.oplPageCreateButton}
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <OplTable
          opls={oplList}
          onEdit={showEditModal}
          onView={showViewModal}
          onDetails={showDetailsModal}
        />
      </Spin>

      <Modal
        title={
          currentOpl
            ? Strings.oplPageEditModalTitle
            : Strings.oplPageCreateModalTitle
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        confirmLoading={submitting}
      >
        <OplForm
          isViewMode={isViewMode}
          form={form}
          loadingUsers={loadingUsers}
          responsibles={responsibles}
          onSubmit={handleSubmit}
          currentOpl={currentOpl}
        />
      </Modal>

      <OplViewModal
        visible={viewModalVisible}
        currentOpl={currentOpl}
        currentDetails={viewDetails}
        onCancel={handleViewCancel}
      />

      <OplDetailsModal
        visible={detailsModalVisible}
        currentOpl={currentOpl}
        currentDetails={currentDetails}
        activeTab={activeDetailTab}
        fileList={fileList}
        uploadLoading={uploadLoading}
        detailForm={detailForm}
        onCancel={handleDetailsCancel}
        onTabChange={handleDetailTabChange}
        onFileChange={handleFileChange}
        onPreview={handlePreview}
        onAddText={(values) => handleAddTextDetail(values)}
        onAddMedia={(type) => handleAddMediaDetail(type as "imagen" | "video" | "pdf")}
      />
    </div>
  );
};

export default Opl;
