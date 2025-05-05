import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Table,
  Spin,
  Typography,
  Badge,
  Button,
  Space,
  Modal,
  Card,
  Row,
  Col,
  Divider,
  notification,
  Input,
} from "antd";
import { useGetCiltMstrBySiteQuery } from "../../../services/cilt/ciltMstrService";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { getStatusAndText } from "../../../utils/Extensions";
import CiltEditModal from "./CiltEditModal";
import CiltDetailsModal from "./CiltDetailsModal";
import CreateCiltSequenceModal from "./CreateCiltSequenceModal";
import EditCiltSequenceModal from "./EditCiltSequenceModal";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { useGetCiltSequencesByCiltMutation } from "../../../services/cilt/ciltSequencesService";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";
import { useGetOplDetailsByOplMutation } from "../../../services/cilt/oplDetailsService";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import {
  FileOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 10;

interface CiltCardListProps {
  searchTerm?: string;
}

const CiltCardList: React.FC<CiltCardListProps> = ({ searchTerm = "" }) => {
  const location = useLocation();
  const siteId = location.state?.siteId || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCilt, setEditingCilt] = useState<CiltMstr | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [detailsCilt, setDetailsCilt] = useState<CiltMstr | null>(null);
  const [isCreateSequenceModalVisible, setIsCreateSequenceModalVisible] =
    useState(false);
  const [sequenceCilt, setSequenceCilt] = useState<CiltMstr | null>(null);

  const [isSequencesModalVisible, setIsSequencesModalVisible] = useState(false);
  const [currentCilt, setCurrentCilt] = useState<CiltMstr | null>(null);
  const [sequences, setSequences] = useState<CiltSequence[]>([]);
  const [loadingSequences, setLoadingSequences] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(
    null
  );
  const [isSequenceDetailModalVisible, setIsSequenceDetailModalVisible] =
    useState(false);
  const [isEditSequenceModalVisible, setIsEditSequenceModalVisible] =
    useState(false);
  const [sequenceSearchTerm, setSequenceSearchTerm] = useState("");
  const [filteredSequences, setFilteredSequences] = useState<CiltSequence[]>(
    []
  );

  const [selectedOpl, setSelectedOpl] = useState<OplMstr | null>(null);
  const [selectedOplDetails, setSelectedOplDetails] = useState<OplDetail[]>([]);
  const [isOplDetailsModalVisible, setIsOplDetailsModalVisible] =
    useState(false);
  const [loadingOplDetails, setLoadingOplDetails] = useState(false);

  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [getOplMstrById] = useGetOplMstrByIdMutation();
  const [getOplDetailsByOpl] = useGetOplDetailsByOplMutation();

  const { data, isLoading, isError, error, refetch } =
    useGetCiltMstrBySiteQuery(siteId, {
      skip: !siteId,
      pollingInterval: 30000,
    });

  const [ciltProcedures, setCiltProcedures] = useState<CiltMstr[]>([]);
  const [filteredCiltProcedures, setFilteredCiltProcedures] = useState<
    CiltMstr[]
  >([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [siteId]);

  useEffect(() => {
    if (data) {
      setCiltProcedures(data);
    }
  }, [data]);

  useEffect(() => {
    filterCilts();
  }, [searchTerm, ciltProcedures]);

  const showEditModal = (cilt: CiltMstr) => {
    setEditingCilt(cilt);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingCilt(null);
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setEditingCilt(null);
    refetch();
  };

  const showDetailsModal = (cilt: CiltMstr) => {
    setDetailsCilt(cilt);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setDetailsCilt(null);
  };

  const showCreateSequenceModal = (cilt: CiltMstr) => {
    setSequenceCilt(cilt);
    setIsCreateSequenceModalVisible(true);
  };

  const handleCreateSequenceCancel = () => {
    setIsCreateSequenceModalVisible(false);
    setSequenceCilt(null);
  };

  const handleCreateSequenceSuccess = () => {
    setIsCreateSequenceModalVisible(false);
    setSequenceCilt(null);
    refetch();
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
  };

  const showSequencesModal = async (cilt: CiltMstr) => {
    setCurrentCilt(cilt);
    setLoadingSequences(true);
    setIsSequencesModalVisible(true);

    try {
      const ciltId = cilt.id.toString();
      const sequencesData = await getCiltSequencesByCilt(ciltId).unwrap();

      const sortedSequences = [...sequencesData].sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
      });

      setSequences(sortedSequences);
      setFilteredSequences(sortedSequences);
      setSequenceSearchTerm("");

      if (sequencesData.length === 0) {
        notification.info({
          message: "Información",
          description: `Este CILT "${cilt.ciltName}" no cuenta aún con secuencias. Puedes crear una nueva secuencia usando el botón "Crear Nueva Secuencia".`,
          duration: 5,
        });
      }
    } catch (error) {
      console.error("Error al cargar secuencias:", error);
    } finally {
      setLoadingSequences(false);
    }
  };

  const handleSequencesModalCancel = () => {
    setIsSequencesModalVisible(false);
    setCurrentCilt(null);
    setSequences([]);
    setFilteredSequences([]);
    setSequenceSearchTerm("");
  };

  const showSequenceDetails = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setIsSequenceDetailModalVisible(true);
  };

  const handleSequenceDetailModalCancel = () => {
    setIsSequenceDetailModalVisible(false);
    setSelectedSequence(null);
  };

  const showEditSequenceModal = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setIsEditSequenceModalVisible(true);
  };

  const handleEditSequenceModalCancel = () => {
    setIsEditSequenceModalVisible(false);
    setSelectedSequence(null);
  };

  const handleEditSequenceSuccess = () => {
    setIsEditSequenceModalVisible(false);
    setSelectedSequence(null);

    if (currentCilt) {
      const ciltId = currentCilt.id.toString();
      getCiltSequencesByCilt(ciltId)
        .unwrap()
        .then((sequencesData) => {
          setSequences(sequencesData);
        })
        .catch((error) => {
          console.error("Error al recargar secuencias:", error);
        });
    }
  };

  const showOplDetails = async (oplId: number | null) => {
    if (!oplId) {
      notification.info({
        message: "Información",
        description: "Esta secuencia no cuenta aún con un OPL asociado.",
        duration: 5,
      });
      return;
    }

    setLoadingOplDetails(true);

    try {
      const opl = await getOplMstrById(oplId.toString()).unwrap();
      setSelectedOpl(opl);

      const details = await getOplDetailsByOpl(oplId.toString()).unwrap();
      setSelectedOplDetails(details);

      setIsOplDetailsModalVisible(true);

      if (details.filter((detail) => detail.type !== "texto").length === 0) {
        notification.info({
          message: "Información",
          description: `Este OPL "${opl.title}" no cuenta aún con archivos multimedia asociados.`,
          duration: 5,
        });
      }
    } catch (error) {
      console.error("Error al cargar detalles del OPL:", error);
    } finally {
      setLoadingOplDetails(false);
    }
  };

  const handleOplDetailsModalCancel = () => {
    setIsOplDetailsModalVisible(false);
    setSelectedOpl(null);
    setSelectedOplDetails([]);
  };

  const getFileName = (url: string | undefined): string => {
    if (!url) return "";

    try {
      const decodedUrl = decodeURIComponent(url);

      const parts = decodedUrl.split("/");
      let fileName = parts[parts.length - 1];

      fileName = fileName.split("?")[0];

      return fileName;
    } catch (e) {
      return url;
    }
  };

  const handleOpenPdf = (url: string) => {
    setCurrentPdfUrl(url);
    setPdfPreviewVisible(true);
  };

  const handleClosePdf = () => {
    setPdfPreviewVisible(false);
    setCurrentPdfUrl("");
  };

  const handleOpenVideo = (url: string) => {
    setCurrentVideoUrl(url);
    setVideoPreviewVisible(true);
  };

  const handleCloseVideo = () => {
    setVideoPreviewVisible(false);
    setCurrentVideoUrl("");
  };

  const columns: ColumnsType<CiltMstr> = [
    {
      title: Strings.ciltMstrListNameColumn,
      dataIndex: "ciltName",
      key: "ciltName",
      render: (text) => text || Strings.ciltMstrNA,
      sorter: (a, b) => (a.ciltName || "").localeCompare(b.ciltName || ""),
    },
    {
      title: Strings.ciltMstrListDescriptionColumn,
      dataIndex: "ciltDescription",
      key: "ciltDescription",
      render: (text) => text || Strings.ciltMstrNA,
      ellipsis: true,
    },
    {
      title: Strings.ciltMstrListCreatorColumn,
      dataIndex: "creatorName",
      key: "creatorName",
      render: (text) => text || Strings.ciltMstrNA,
    },
    {
      title: Strings.ciltMstrListStatusColumn,
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const { status: badgeStatus, text } = getStatusAndText(status || "");
        return <Badge status={badgeStatus} text={text} />;
      },
      filters: [
        { text: Strings.ciltMstrListActiveFilter, value: "A" },
        { text: Strings.ciltMstrListSuspendedFilter, value: "S" },
        { text: Strings.ciltMstrListCanceledFilter, value: "C" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: Strings.ciltMstrListCreationDateColumn,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : Strings.ciltMstrNA,
      sorter: (a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
    },
    {
      title: Strings.ciltMstrListActionsColumn,
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            onClick={() => showEditModal(record)}
          >
            Editar
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => showDetailsModal(record)}
          >
            Detalles
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => showCreateSequenceModal(record)}
          >
            Crear Secuencia
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => showSequencesModal(record)}
          >
            Ver Secuencias
          </Button>
        </Space>
      ),
    },
  ];

  const filterCilts = () => {
    if (!ciltProcedures.length) return;

    if (searchTerm) {
      const filtered = ciltProcedures.filter((cilt) =>
        cilt.ciltName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCiltProcedures(filtered);
    } else {
      setFilteredCiltProcedures(ciltProcedures);
    }
  };

  const handleSequenceSearch = (value: string) => {
    setSequenceSearchTerm(value);

    if (!value.trim()) {
      setFilteredSequences(sequences);
    } else {
      const filtered = sequences.filter(
        (sequence) =>
          sequence.secuenceList?.toLowerCase().includes(value.toLowerCase()) ||
          sequence.order?.toString().includes(value) ||
          sequence.standardTime?.toString().includes(value) ||
          sequence.toolsRequired?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSequences(filtered);
    }
  };

  if (!siteId) {
    return <Text type="secondary">{Strings.requiredSite}</Text>;
  }

  if (isLoading) {
    return <Spin tip={Strings.loading} />;
  }

  if (isError) {
    console.error("Error fetching CILT procedures:", error);
    return <Text type="danger">{Strings.errorLoadingNewTypesCilt}</Text>;
  }

  return (
    <>
      <Table
        dataSource={filteredCiltProcedures}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: DEFAULT_PAGE_SIZE,
          total: filteredCiltProcedures.length,
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
        bordered
        size="middle"
        scroll={{ x: true }}
      />

      {/* Edit Modal */}
      <CiltEditModal
        visible={isEditModalVisible}
        cilt={editingCilt}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      {/* Details Modal */}
      <CiltDetailsModal
        visible={isDetailsModalVisible}
        cilt={detailsCilt}
        onCancel={handleDetailsCancel}
      />

      {/* Create Sequence Modal */}
      <CreateCiltSequenceModal
        visible={isCreateSequenceModalVisible}
        cilt={sequenceCilt}
        onCancel={handleCreateSequenceCancel}
        onSuccess={handleCreateSequenceSuccess}
      />

      {/* Sequences Modal */}
      <Modal
        title={`Secuencias de ${currentCilt?.ciltName || "CILT"}`}
        open={isSequencesModalVisible}
        onCancel={handleSequencesModalCancel}
        footer={[
          <Button key="close" onClick={handleSequencesModalCancel}>
            Cerrar
          </Button>,
          <Button
            key="create"
            type="primary"
            onClick={() => {
              handleSequencesModalCancel();
              showCreateSequenceModal(currentCilt as CiltMstr);
            }}
            disabled={!currentCilt}
          >
            Crear Nueva Secuencia
          </Button>,
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={16}>
              <Input
                placeholder="Buscar por descripción, orden o tiempo estándar"
                value={sequenceSearchTerm}
                onChange={(e) => handleSequenceSearch(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Text>Total: {filteredSequences.length} secuencias</Text>
            </Col>
          </Row>
        </div>

        <Spin spinning={loadingSequences}>
          {filteredSequences.length === 0 ? (
            sequences.length === 0 ? (
              <Text type="secondary">
                No hay secuencias asociadas a este CILT.
              </Text>
            ) : (
              <Text type="secondary">
                No se encontraron secuencias que coincidan con la búsqueda.
              </Text>
            )
          ) : (
            <div
              style={{ maxHeight: "60vh", overflowY: "auto", padding: "10px" }}
            >
              {filteredSequences.map((sequence) => (
                <Card
                  key={sequence.id}
                  style={{
                    marginBottom: 16,
                    borderLeft: `4px solid ${
                      sequence.secuenceColor &&
                      sequence.secuenceColor.startsWith("#")
                        ? sequence.secuenceColor
                        : `#${sequence.secuenceColor || "1890ff"}`
                    }`,
                  }}
                  hoverable
                >
                  <Row gutter={[16, 16]}>
                    <Col span={16}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            backgroundColor:
                              sequence.secuenceColor &&
                              sequence.secuenceColor.startsWith("#")
                                ? sequence.secuenceColor
                                : `#${sequence.secuenceColor || "f0f0f0"}`,
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            marginRight: "10px",
                            border: "1px solid #d9d9d9",
                          }}
                        />
                        <Text strong>Secuencia {sequence.order}</Text>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <Text type="secondary">Tiempo Estándar:</Text>{" "}
                        <Text>{sequence.standardTime || "N/A"}</Text>
                      </div>

                      {sequence.toolsRequired && (
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Herramientas:</Text>{" "}
                          <Text>{sequence.toolsRequired}</Text>
                        </div>
                      )}

                      <div>
                        <Text type="secondary">Creado:</Text>{" "}
                        <Text>
                          {sequence.createdAt
                            ? new Date(sequence.createdAt).toLocaleDateString()
                            : "N/A"}
                        </Text>
                      </div>
                    </Col>
                    <Col
                      span={8}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-end",
                      }}
                    >
                      <Space direction="vertical">
                        <Button
                          type="primary"
                          onClick={() => showSequenceDetails(sequence)}
                        >
                          Ver Detalles
                        </Button>

                        <Button
                          type="default"
                          onClick={() =>
                            showOplDetails(sequence.referenceOplSop)
                          }
                          disabled={!sequence.referenceOplSop}
                        >
                          Ver OPL Referencia
                        </Button>

                        <Button
                          type="default"
                          onClick={() =>
                            showOplDetails(sequence.remediationOplSop)
                          }
                          disabled={!sequence.remediationOplSop}
                        >
                          Ver OPL Remediación
                        </Button>

                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => showEditSequenceModal(sequence)}
                        >
                          Editar Secuencia
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          )}
        </Spin>
      </Modal>

      {/* Sequence Detail Modal */}
      <Modal
        title="Detalles de la Secuencia"
        open={isSequenceDetailModalVisible}
        onCancel={handleSequenceDetailModalCancel}
        footer={null}
        width={700}
      >
        {selectedSequence && (
          <div>
            <Card bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Posición:</Text>
                  <div>
                    <Text strong>{selectedSequence.positionName || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tipo de CILT:</Text>
                  <div>
                    <Text strong>{selectedSequence.ciltTypeName || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tiempo Estándar:</Text>
                  <div>
                    <Text strong>{selectedSequence.standardTime || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Color:</Text>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        backgroundColor:
                          selectedSequence.secuenceColor &&
                          selectedSequence.secuenceColor.startsWith("#")
                            ? selectedSequence.secuenceColor
                            : `#${selectedSequence.secuenceColor || "f0f0f0"}`,
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        marginRight: "10px",
                        border: "1px solid #d9d9d9",
                      }}
                    />
                    <Text>
                      {selectedSequence.secuenceColor &&
                      selectedSequence.secuenceColor.startsWith("#")
                        ? selectedSequence.secuenceColor
                        : `#${selectedSequence.secuenceColor || "N/A"}`}
                    </Text>
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text type="secondary">Herramientas Requeridas:</Text>
                  <div>
                    <Text>{selectedSequence.toolsRequired || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Razón de Parada:</Text>
                  <div>
                    <Text>{selectedSequence.stoppageReason ? "Sí" : "No"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Estándar OK:</Text>
                  <div>
                    <Text>{selectedSequence.standardOk || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Cantidad de Imágenes (Crear):</Text>
                  <div>
                    <Text>
                      {selectedSequence.quantityPicturesCreate || "0"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Cantidad de Imágenes (Cerrar):</Text>
                  <div>
                    <Text>{selectedSequence.quantityPicturesClose || "0"}</Text>
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>OPLs Relacionados</Text>
                </Col>

                <Col span={12}>
                  <Text type="secondary">OPL de Referencia:</Text>
                  <div>
                    {selectedSequence.referenceOplSop ? (
                      <Button
                        type="link"
                        onClick={() =>
                          showOplDetails(selectedSequence.referenceOplSop)
                        }
                      >
                        Ver OPL de Referencia
                      </Button>
                    ) : (
                      <Text>N/A</Text>
                    )}
                  </div>
                </Col>

                <Col span={12}>
                  <Text type="secondary">OPL de Remediación:</Text>
                  <div>
                    {selectedSequence.remediationOplSop ? (
                      <Button
                        type="link"
                        onClick={() =>
                          showOplDetails(selectedSequence.remediationOplSop)
                        }
                      >
                        Ver OPL de Remediación
                      </Button>
                    ) : (
                      <Text>N/A</Text>
                    )}
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Fecha de Creación:</Text>
                  <div>
                    <Text>
                      {selectedSequence.createdAt
                        ? new Date(
                            selectedSequence.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Última Actualización:</Text>
                  <div>
                    <Text>
                      {selectedSequence.updatedAt
                        ? new Date(
                            selectedSequence.updatedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      {/* Edit Sequence Modal */}
      <EditCiltSequenceModal
        visible={isEditSequenceModalVisible}
        sequence={selectedSequence}
        onCancel={handleEditSequenceModalCancel}
        onSuccess={handleEditSequenceSuccess}
      />

      {/* OPL Details Modal */}
      <Modal
        title={`Detalles del OPL: ${selectedOpl?.title || ""}`}
        open={isOplDetailsModalVisible}
        onCancel={handleOplDetailsModalCancel}
        footer={null}
        width={800}
      >
        <Spin spinning={loadingOplDetails}>
          {selectedOpl && (
            <div>
              <Card bordered={false} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text type="secondary">Objetivo:</Text>
                    <div>
                      <Text>{selectedOpl.objetive || "N/A"}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Text strong style={{ display: "block", marginBottom: 16 }}>
                Archivos Multimedia:
              </Text>

              {selectedOplDetails.filter((detail) => detail.type !== "texto")
                .length === 0 ? (
                <Text type="secondary">
                  No hay archivos multimedia disponibles
                </Text>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {selectedOplDetails
                    .filter((detail) => detail.type !== "texto")
                    .map((detail) => {
                      if (detail.type === "imagen" && detail.mediaUrl) {
                        return (
                          <Card
                            key={detail.id}
                            size="small"
                            style={{ marginBottom: 16 }}
                            title={
                              <Space>
                                <PictureOutlined style={{ color: "#1890ff" }} />{" "}
                                Imagen
                              </Space>
                            }
                          >
                            <div style={{ textAlign: "center" }}>
                              <img
                                src={detail.mediaUrl}
                                alt="Imagen OPL"
                                style={{ maxWidth: "100%", maxHeight: "200px" }}
                              />
                              <div style={{ marginTop: 8 }}>
                                <Text>{getFileName(detail.mediaUrl)}</Text>
                              </div>
                            </div>
                          </Card>
                        );
                      } else if (detail.type === "video" && detail.mediaUrl) {
                        return (
                          <Card
                            key={detail.id}
                            size="small"
                            style={{ marginBottom: 16 }}
                            title={
                              <Space>
                                <VideoCameraOutlined
                                  style={{ color: "#1890ff" }}
                                />{" "}
                                Video
                              </Space>
                            }
                          >
                            <div style={{ textAlign: "center" }}>
                              <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={() =>
                                  handleOpenVideo(detail.mediaUrl || "")
                                }
                              >
                                Reproducir Video
                              </Button>
                              <div style={{ marginTop: 8 }}>
                                <Text>{getFileName(detail.mediaUrl)}</Text>
                              </div>
                            </div>
                          </Card>
                        );
                      } else if (detail.type === "pdf" && detail.mediaUrl) {
                        return (
                          <Card
                            key={detail.id}
                            size="small"
                            style={{ marginBottom: 16 }}
                            title={
                              <Space>
                                <FilePdfOutlined style={{ color: "#1890ff" }} />{" "}
                                PDF
                              </Space>
                            }
                          >
                            <div style={{ textAlign: "center" }}>
                              <Button
                                type="primary"
                                icon={<FileOutlined />}
                                onClick={() =>
                                  handleOpenPdf(detail.mediaUrl || "")
                                }
                              >
                                Ver PDF
                              </Button>
                              <div style={{ marginTop: 8 }}>
                                <Text>{getFileName(detail.mediaUrl)}</Text>
                              </div>
                            </div>
                          </Card>
                        );
                      }
                      return null;
                    })}
                </div>
              )}
            </div>
          )}
        </Spin>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        title="Visualización de PDF"
        open={pdfPreviewVisible}
        onCancel={handleClosePdf}
        footer={null}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: "80vh", padding: 0 }}
      >
        {currentPdfUrl && (
          <iframe
            src={`${currentPdfUrl}#toolbar=1&navpanes=1`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Viewer"
          />
        )}
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        title="Reproducción de Video"
        open={videoPreviewVisible}
        onCancel={handleCloseVideo}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        {currentVideoUrl && (
          <div style={{ textAlign: "center" }}>
            <video
              controls
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
              src={currentVideoUrl}
            >
              Tu navegador no soporta la reproducción de videos.
            </video>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CiltCardList;
