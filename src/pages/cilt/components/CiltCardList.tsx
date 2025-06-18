import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import  Constants  from "../../../utils/Constants";
import { Spin, Typography, notification, Modal } from "antd";
import { useGetCiltMstrBySiteQuery } from "../../../services/cilt/ciltMstrService";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import { useGetCiltSequencesByCiltMutation } from "../../../services/cilt/ciltSequencesService";
import { useGetOplMstrByIdMutation } from "../../../services/cilt/oplMstrService";
import { useGetOplDetailsByOplMutation } from "../../../services/cilt/oplDetailsService";
import Strings from "../../../utils/localizations/Strings";

import CiltTable from "./CiltTable";
import CiltEditModal from "./CiltEditModal";
import CiltDetailsModal from "./CiltDetailsModal";
import CreateCiltSequenceModal from "./CreateCiltSequenceModal";
import SequencesModal from "./SequencesModal";
import SequenceDetailsModal from "./SequenceDetailsModal";
import EditCiltSequenceModal from "./EditCiltSequenceModal";
import OplDetailsModal from "./OplDetailsModal";
import CloneCiltModal from "./CloneCiltModal";
import type { TablePaginationConfig } from "antd/es/table";

const { Text } = Typography;

interface CiltCardListProps {
  searchTerm?: string;
}

const CiltCardList: React.FC<CiltCardListProps> = ({ searchTerm = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const siteId = location.state?.siteId ? Number(location.state.siteId) : undefined;
  const [currentPage, setCurrentPage] = useState(1);

  const [ciltProcedures, setCiltProcedures] = useState<CiltMstr[]>([]);
  const [filteredCiltProcedures, setFilteredCiltProcedures] = useState<
    CiltMstr[]
  >([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isCreateSequenceModalVisible, setIsCreateSequenceModalVisible] =
    useState(false);
  const [isSequencesModalVisible, setIsSequencesModalVisible] = useState(false);
  const [isSequenceDetailModalVisible, setIsSequenceDetailModalVisible] =
    useState(false);
  const [isEditSequenceModalVisible, setIsEditSequenceModalVisible] =
    useState(false);
  const [isOplDetailsModalVisible, setIsOplDetailsModalVisible] =
    useState(false);
  const [isCloneCiltModalVisible, setIsCloneCiltModalVisible] = useState(false);

  const [editingCilt, setEditingCilt] = useState<CiltMstr | null>(null);
  const [detailsCilt, setDetailsCilt] = useState<CiltMstr | null>(null);
  const [ciltToClone, setCiltToClone] = useState<CiltMstr | null>(null);
  const [sequenceCilt, setSequenceCilt] = useState<CiltMstr | null>(null);
  const [currentCilt, setCurrentCilt] = useState<CiltMstr | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(
    null
  );

  const [sequences, setSequences] = useState<CiltSequence[]>([]);
  const [loadingSequences] = useState(false);

  const [selectedOpl, setSelectedOpl] = useState<OplMstr | null>(null);
  const [selectedOplDetails, setSelectedOplDetails] = useState<OplDetail[]>([]);
  const [loadingOplDetails, setLoadingOplDetails] = useState(false);

  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [getOplMstrById] = useGetOplMstrByIdMutation();
  const [getOplDetailsByOpl] = useGetOplDetailsByOplMutation();

  const { data, isLoading, isError, error, refetch } =
    useGetCiltMstrBySiteQuery(siteId ? String(siteId) : "", {
      skip: !siteId,
      pollingInterval: 30000,

      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [siteId]);

  useEffect(() => {
    if (data) {
      setCiltProcedures(data);

      if (refreshTrigger > 0) {
        setCurrentPage(1);
      }
    }
  }, [data, refreshTrigger]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refetching data due to refresh trigger:", refreshTrigger);
      refetch();
    }
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    filterCilts();
  }, [searchTerm, ciltProcedures]);

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

  const showCloneModal = (cilt: CiltMstr) => {
    setCiltToClone(cilt);
    setIsCloneCiltModalVisible(true);
  };

  const handleCloneCancel = () => {
    setIsCloneCiltModalVisible(false);
    setCiltToClone(null);
  };

  const handleCloneSuccess = () => {
    setIsCloneCiltModalVisible(false);
    setCiltToClone(null);
    setRefreshTrigger((prev) => prev + 1);
    refetch();
  };

  const navigateToSequences = (cilt: CiltMstr) => {
    const ciltId = cilt.id.toString();
    // Pasar la información del sitio en el estado de navegación para mantener la consistencia en el SideBar
    navigate(`/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltSequences}/${ciltId}`, {
      state: {
        siteId: location.state?.siteId,
        siteName: location.state?.siteName,
        siteLogo: location.state?.siteLogo
      }
    });
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

    setRefreshTrigger((prev) => prev + 1);

    refetch();
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current || 1;
    setCurrentPage(newPage);

    if (newPage !== currentPage) {
      console.log("Page changed, forcing data refresh");
      refetch();
    }
  };


  const handleSequencesModalCancel = () => {
    setIsSequencesModalVisible(false);
    setCurrentCilt(null);
    setSequences([]);
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
          const sortedSequences = [...sequencesData].sort((a, b) => {
            return (a.order || 0) - (b.order || 0);
          });
          setSequences(sortedSequences);
        })
        .catch((error) => {
          console.error("Error reloading sequences:", error);
        });
    }
  };

  const showOplDetails = async (oplId: number | null) => {
    if (!oplId) {
      notification.info({
        message: Strings.information,
        description: Strings.noOplAssociated,
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
          message: Strings.information,
          description: `${Strings.thisOpl} "${opl.title}" ${Strings.noMediaFiles}`,
          duration: 5,
        });
      }
    } catch (error) {
      console.error("Error loading OPL details:", error);
    } finally {
      setLoadingOplDetails(false);
    }
  };

  const handleOplDetailsModalCancel = () => {
    setIsOplDetailsModalVisible(false);
    setSelectedOpl(null);
    setSelectedOplDetails([]);
  };



  const handleClosePdf = () => {
    setPdfPreviewVisible(false);
    setCurrentPdfUrl("");
  };


  const handleCloseVideo = () => {
    setVideoPreviewVisible(false);
    setCurrentVideoUrl("");
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
      {/* Main Table */}
      <CiltTable
        ciltList={filteredCiltProcedures}
        loading={isLoading}
        currentPage={currentPage}
        onTableChange={handleTableChange}
        onEdit={showEditModal}
        onDetails={showDetailsModal}
        onNavigateToSequences={navigateToSequences}
        onClone={showCloneModal}
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
        onClone={showCloneModal}
      />

      {/* Create Sequence Modal */}
      <CreateCiltSequenceModal
        visible={isCreateSequenceModalVisible}
        cilt={sequenceCilt}
        onCancel={handleCreateSequenceCancel}
        onSuccess={handleCreateSequenceSuccess}
        siteId={siteId}
      />

      {/* Sequences Modal */}
      <SequencesModal
        open={isSequencesModalVisible}
        currentCilt={currentCilt}
        sequences={sequences}
        loading={loadingSequences}
        onCancel={handleSequencesModalCancel}
        onCreateSequence={showCreateSequenceModal}
        onViewDetails={showSequenceDetails}
        onViewOpl={showOplDetails}
        onEditSequence={showEditSequenceModal}
      />

      {/* Sequence Detail Modal */}
      <SequenceDetailsModal
        visible={isSequenceDetailModalVisible}
        sequence={selectedSequence}
        onCancel={handleSequenceDetailModalCancel}
        onViewOpl={showOplDetails}
      />

      {/* Edit Sequence Modal */}
      <EditCiltSequenceModal
        open={isEditSequenceModalVisible}
        sequence={selectedSequence}
        onCancel={handleEditSequenceModalCancel}
        onSuccess={handleEditSequenceSuccess}
      />

      {/* OPL Details Modal */}
      <OplDetailsModal
        visible={isOplDetailsModalVisible}
        opl={selectedOpl}
        details={selectedOplDetails}
        loading={loadingOplDetails}
        onCancel={handleOplDetailsModalCancel}
      />

      {/* Clone CILT Modal */}
      <CloneCiltModal
        visible={isCloneCiltModalVisible}
        cilt={ciltToClone}
        onCancel={handleCloneCancel}
        onSuccess={handleCloneSuccess}
      />

      {/* PDF Preview Modal */}
      <Modal
        title="PDF Viewer"
        open={pdfPreviewVisible}
        onCancel={handleClosePdf}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        {currentPdfUrl && (
          <iframe
            src={currentPdfUrl}
            title="PDF Viewer"
            style={{ width: "100%", height: "80vh" }}
          />
        )}
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        title="Video Player"
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
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
            >
              <source src={currentVideoUrl} type="video/mp4" />
              {Strings.browserNotSupportVideo}
            </video>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CiltCardList;
