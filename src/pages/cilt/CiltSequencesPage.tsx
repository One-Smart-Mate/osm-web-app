import { useState, useEffect } from "react";
import { Button, Space, Spin, Typography, notification, Input, Table } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { SearchOutlined, ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import MainContainer from "../layouts/MainContainer";
import { CiltMstr } from "../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../data/cilt/ciltSequences/ciltSequences";
import { OplMstr } from "../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../data/cilt/oplDetails/oplDetails";
import { useGetCiltMstrByIdMutation } from "../../services/cilt/ciltMstrService";
import { useGetCiltSequencesByCiltMutation } from "../../services/cilt/ciltSequencesService";
import { useGetOplMstrByIdMutation } from "../../services/cilt/oplMstrService";
import { useGetOplDetailsByOplMutation } from "../../services/cilt/oplDetailsService";
import CreateCiltSequenceModal from "./components/CreateCiltSequenceModal";
import SequenceDetailsModal from "./components/SequenceDetailsModal";
import EditCiltSequenceModal from "./components/EditCiltSequenceModal";
import OplDetailsModal from "./components/OplDetailsModal";
import ScheduleSecuence from "./components/ScheduleSecuence";
import Constants from "../../utils/Constants";
import { formatSecondsToNaturalTime } from "../../utils/timeUtils";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../utils/localizations/Strings";

const { Text } = Typography;

const CiltSequencesPage = () => {
  const { ciltId } = useParams();
  const navigate = useNavigate();

  const [currentCilt, setCurrentCilt] = useState<CiltMstr | null>(null);
  const [sequences, setSequences] = useState<CiltSequence[]>([]);
  const [filteredSequences, setFilteredSequences] = useState<CiltSequence[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [isCreateSequenceModalVisible, setIsCreateSequenceModalVisible] = useState(false);
  const [isSequenceDetailModalVisible, setIsSequenceDetailModalVisible] = useState(false);
  const [isEditSequenceModalVisible, setIsEditSequenceModalVisible] = useState(false);
  const [isOplDetailsModalVisible, setIsOplDetailsModalVisible] = useState(false);
  const [isScheduleSecuenceVisible, setScheduleSecuenceVisible] = useState(false);
  
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(null);
  const [selectedOpl, setSelectedOpl] = useState<OplMstr | null>(null);
  const [selectedOplDetails, setSelectedOplDetails] = useState<OplDetail[]>([]);
  const [loadingOplDetails, setLoadingOplDetails] = useState(false);
  
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  const [getCiltById] = useGetCiltMstrByIdMutation();
  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [getOplMstrById] = useGetOplMstrByIdMutation();
  const [getOplDetailsByOpl] = useGetOplDetailsByOplMutation();

  useEffect(() => {
    if (!ciltId) return;
    
    const loadCiltAndSequences = async () => {
      setLoading(true);
      try {
        const ciltData = await getCiltById(ciltId).unwrap();
        setCurrentCilt(ciltData);
        
        const sequencesData = await getCiltSequencesByCilt(ciltId).unwrap();
        const sortedSequences = [...sequencesData].sort((a, b) => {
          return (a.order || 0) - (b.order || 0);
        });
        
        setSequences(sortedSequences);
        setFilteredSequences(sortedSequences.filter(
          (sequence) => sequence.status === Constants.STATUS_ACTIVE
        ));
        
        if (sequencesData.length === 0) {
          notification.info({
            message: Strings.information,
            description: `${Strings.thisCilt} "${ciltData.ciltName}" ${Strings.noSequences}`,
            duration: 5,
          });
        }
      } catch (error) {
        console.error(Strings.errorLoadingCiltOrSequences, error);
        notification.error({
          message: Strings.error,
          description: Strings.errorLoadingCiltOrSequences,
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCiltAndSequences();
  }, [ciltId, getCiltById, getCiltSequencesByCilt, refreshTrigger]);

  useEffect(() => {
    const activeSequences = sequences.filter(
      (sequence) => sequence.status === Constants.STATUS_ACTIVE
    );
    
    if (!searchTerm.trim()) {
      setFilteredSequences(activeSequences);
    } else {
      const filtered = activeSequences.filter(
        (sequence) =>
          sequence.secuenceList?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sequence.order?.toString().includes(searchTerm) ||
          sequence.standardTime?.toString().includes(searchTerm) ||
          sequence.toolsRequired?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSequences(filtered);
    }
  }, [sequences, searchTerm]);

  const showCreateSequenceModal = () => {
    if (!currentCilt) return;
    setIsCreateSequenceModalVisible(true);
  };

  const handleCreateSequenceCancel = () => {
    setIsCreateSequenceModalVisible(false);
  };

  const handleCreateSequenceSuccess = () => {
    setIsCreateSequenceModalVisible(false);
    setRefreshTrigger((prev) => prev + 1);
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
    setRefreshTrigger((prev) => prev + 1);
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
      console.error(Strings.errorLoadingOplDetails, error);
    } finally {
      setLoadingOplDetails(false);
    }
  };

  const handleOplDetailsModalCancel = () => {
    setIsOplDetailsModalVisible(false);
    setSelectedOpl(null);
    setSelectedOplDetails([]);
  };

  const showScheduleSequence = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setScheduleSecuenceVisible(true);
  };

  const handleScheduleSequenceCancel = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequence(null);
  };

  const handleScheduleSequenceSuccess = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequence(null);
  };

  const goBack = () => {
    navigate(-1);
  };
  const columns: ColumnsType<CiltSequence> = [
    {
      title: Strings.color,
      dataIndex: "secuenceColor",
      key: "secuenceColor",
      render: (color) => (
        <div
          style={{
            backgroundColor: color && color.startsWith("#") ? color : `#${color || "f0f0f0"}`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid #d9d9d9",
          }}
        />
      ),
      width: 80,
    },
    {
      title: Strings.standardTime,
      dataIndex: "standardTime",
      key: "standardTime",
      render: (time) => formatSecondsToNaturalTime(time) || "N/A",
      width: 150,
    },
    {
      title: Strings.frequencyCode,
      dataIndex: "frecuencyCode",
      key: "frecuencyCode",
      render: (text) => text || "N/A",
      width: 120,
    },
    {
      title: Strings.ciltType,
      dataIndex: "ciltTypeName",
      key: "ciltTypeName",
      render: (text) => text || "N/A",
      width: 120,
    },
    {
      title: Strings.actions,
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="primary" size="small" onClick={() => showSequenceDetails(record)}>
            {Strings.viewDetails}
          </Button>
          <Button 
            type="default" 
            size="small" 
            onClick={() => record.referenceOplSopId && showOplDetails(record.referenceOplSopId)}
            disabled={!record.referenceOplSopId || record.referenceOplSopId <= 0}
          >
            {Strings.viewReferenceOpl}
          </Button>
          <Button 
            type="default" 
            size="small" 
            onClick={() => showOplDetails(record.remediationOplSopId)}
            disabled={!record.remediationOplSopId}
          >
            {Strings.viewRemediationOpl}
          </Button>
          <Button type="primary" size="small" onClick={() => showEditSequenceModal(record)}>
            {Strings.editSequence}
          </Button>
          <Button type="default" size="small" onClick={() => showScheduleSequence(record)}>
            {Strings.scheduleSequence}
          </Button>
        </Space>
      ),
      width: 500,
    },
  ];

  return (
    <>
      <MainContainer
        title={currentCilt ? `${Strings.secuencesOf} ${currentCilt.ciltName}` : Strings.sequences}
        description=""
        content={
          <div>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                  {Strings.goBack}
              </Button>
              
              <Input
                placeholder={Strings.searchBarDefaultPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
              />
              
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateSequenceModal}
                disabled={!currentCilt}
              >
                {Strings.createSequence}
              </Button>
              
              <Text style={{ marginLeft: "auto" }}>
                {Strings.total}: {filteredSequences.length} {Strings.sequences}
              </Text>
            </div>

            <Spin spinning={loading}>
              <Table
                dataSource={filteredSequences}
                columns={columns}
                rowKey={(record) => String(record.id)}
                pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"] }}
                bordered
                size="middle"
                scroll={{ x: 1200 }}
              />
            </Spin>
          </div>
        }
      />
      {currentCilt && (
        <CreateCiltSequenceModal
          visible={isCreateSequenceModalVisible}
          cilt={currentCilt}
          onCancel={handleCreateSequenceCancel}
          onSuccess={handleCreateSequenceSuccess}
        />
      )}
      
      <SequenceDetailsModal
        visible={isSequenceDetailModalVisible}
        sequence={selectedSequence}
        onCancel={handleSequenceDetailModalCancel}
        onViewOpl={showOplDetails}
      />
      
      <EditCiltSequenceModal
        open={isEditSequenceModalVisible}
        sequence={selectedSequence}
        onCancel={handleEditSequenceModalCancel}
        onSuccess={handleEditSequenceSuccess}
      />
      
      <OplDetailsModal
        visible={isOplDetailsModalVisible}
        opl={selectedOpl}
        details={selectedOplDetails}
        loading={loadingOplDetails}
        onCancel={handleOplDetailsModalCancel}
      />
      
      <ScheduleSecuence
        open={isScheduleSecuenceVisible}
        onCancel={handleScheduleSequenceCancel}
        onSave={handleScheduleSequenceSuccess}
      />
    </>
  );
};

export default CiltSequencesPage;
