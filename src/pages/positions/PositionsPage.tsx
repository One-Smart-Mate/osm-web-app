import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Input, Table, Form, Tag, Spin, List, Typography } from "antd";
import { SearchOutlined, EditOutlined, FilePdfOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import LevelTreeModal from "./components/LevelTreeModal";
import RegisterPositionForm from "./components/RegisterPositionForm";
import UpdatePositionForm from "./components/UpdatePositionForm";
import { useGetSiteMutation } from "../../services/siteService";
import { useGetPositionsBySiteIdQuery, useGetPositionUsersQuery } from "../../services/positionService";
import { Position } from "../../data/postiions/positions";
import { Responsible } from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import Constants from "../../utils/Constants";

const { Text } = Typography;

const PositionsPage = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [isTreeModalVisible, setIsTreeModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [isPositionFormVisible, setIsPositionFormVisible] = useState(false);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [positionForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [getSite] = useGetSiteMutation();
  
  const location = useLocation();
  const siteId = location.state?.siteId || "";
  const siteName = location.state?.siteName || "";

  // Fetch positions by site ID
  const { 
    data: positions = [], 
    isLoading: isLoadingPositions,
    refetch: refetchPositions
  } = useGetPositionsBySiteIdQuery(siteId, {
    skip: !siteId,
    // Refetch positions every 30 seconds
    pollingInterval: 30000,
  });

  useEffect(() => {
    if (positions) {
      setFilteredPositions(positions);
    }
  }, [positions]);

  useEffect(() => {
    if (siteId) {
      getSite(siteId);
    }
  }, [siteId, getSite]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!positions) return;
    
    const filtered = positions.filter(
      (position) =>
        position.areaName?.toLowerCase().includes(value.toLowerCase()) ||
        position.levelName?.toLowerCase().includes(value.toLowerCase()) ||
        position.name?.toLowerCase().includes(value.toLowerCase()) ||
        position.description?.toLowerCase().includes(value.toLowerCase()) ||
        position.status?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPositions(filtered);
  };

  const showTreeModal = () => {
    setIsTreeModalVisible(true);
  };

  const hideTreeModal = () => {
    setIsTreeModalVisible(false);
  };

  const handleLevelSelect = async (levelData: any) => {
    console.log("Selected level for position creation:", levelData);
    
    try {
      // Fetch site data to get the siteType
      const siteResponse = await getSite(siteId).unwrap();
      console.log("Site data:", siteResponse);
      
      // Enhance the level data with site information
      const enhancedLevelData = {
        ...levelData,
        siteId: siteId,
        siteName: siteName,
        siteType: siteResponse.siteType, // Get siteType from API response
      };
      
      setSelectedLevel(enhancedLevelData);
      setIsPositionFormVisible(true);
    } catch (error) {
      console.error("Error fetching site data:", error);
    }
  };

  const handleFormCancel = () => {
    setIsPositionFormVisible(false);
    positionForm.resetFields();
  };

  const handleFormSuccess = () => {
    setIsPositionFormVisible(false);
    positionForm.resetFields();
    // Refresh the positions list
    refetchPositions();
  };

  const handleEditPosition = (position: Position) => {
    setSelectedPosition(position);
    updateForm.setFieldsValue({
      name: position.name,
      description: position.description || "",
      status: position.status,
    });
    setIsUpdateFormVisible(true);
  };

  const handleUpdateCancel = () => {
    setIsUpdateFormVisible(false);
    setSelectedPosition(null);
    updateForm.resetFields();
  };

  const handleUpdateSuccess = () => {
    setIsUpdateFormVisible(false);
    setSelectedPosition(null);
    updateForm.resetFields();
    // Refresh the positions list
    refetchPositions();
  };

  const handlePopoverVisibleChange = (visible: boolean, positionId: string) => {
    setOpenPopoverId(visible ? positionId : null);
  };

  // Component to render users assigned to a position
  const PositionUsers = ({ positionId }: { positionId: string }) => {
    const { data: users = [], isLoading } = useGetPositionUsersQuery(positionId);

    if (isLoading) {
      return <Spin size="small" />;
    }

    if (!users.length) {
      return <Text type="secondary">{t(Strings.noAssignedUsers)}</Text>;
    }

    return (
      <List
        size="small"
        bordered
        className="shadow-md rounded-md bg-white max-w-xs"
        dataSource={users}
        renderItem={(user: Responsible) => (
          <List.Item>
            <UserOutlined className="mr-2" /> {user.name}
          </List.Item>
        )}
      />
    );
  };

  // Helper function to render status tag
  const renderStatusTag = (status: string) => {
    if (status === Constants.STATUS_ACTIVE) {
      return <Tag color="green">{t(Strings.active)}</Tag>;
    } else if (status === Constants.STATUS_SUSPENDED) {
      return <Tag color="orange">{t(Strings.suspended)}</Tag>;
    } else if (status === Constants.STATUS_CANCELED) {
      return <Tag color="red">{t(Strings.canceled)}</Tag>;
    } else {
      return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: t(Strings.positionAreaHeader),
      dataIndex: "areaName",
      key: "areaName",
      width: 150,
    },
    {
      title: t(Strings.positionNodeZoneHeader),
      dataIndex: "levelName",
      key: "levelName",
      width: 150,
    },
    {
      title: t(Strings.positionNameHeader),
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: t(Strings.positionDescriptionHeader),
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (text: string) => text || "-",
    },
    {
      title: t(Strings.positionStatusHeader),
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => renderStatusTag(status),
    },
    {
      title: t(Strings.positionActionsHeader),
      key: "actions",
      width: 100,
      render: (_: any, record: Position) => (
        <div className="flex space-x-2">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditPosition(record);
            }}
          />
          <Button 
            type="primary" 
            icon={<FilePdfOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {siteName} - {t(Strings.positions)}
        </h1>
        <Button type="primary" onClick={showTreeModal}>
          {t(Strings.createPosition)}
        </Button>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder={t(Strings.searchPositions)}
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          value={searchText}
          className="max-w-md w-96"
          allowClear
        />
        <div className="text-sm text-gray-500">
          {filteredPositions.length} {filteredPositions.length === 1 
            ? t(Strings.positionFound) 
            : t(Strings.positionsFound)}
        </div>
      </div>
      
      {isLoadingPositions ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip={t(Strings.loadingPositions)} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            dataSource={filteredPositions}
            columns={columns}
            rowKey={(record) => record.id.toString()}
            onRow={(record) => ({
              onClick: () => handlePopoverVisibleChange(openPopoverId !== record.id.toString(), record.id.toString()),
              className: openPopoverId === record.id.toString() ? "bg-blue-50" : ""
            })}
            pagination={{ 
              pageSize: Constants.DEFAULT_PAGE_SIZE,
              showSizeChanger: true, 
              pageSizeOptions: Constants.POSITION_PAGE_OPTIONS,
              position: ['bottomCenter']
            }}
            locale={{ 
              emptyText: t(Strings.noPositionsToShow),
              filterConfirm: t(Strings.accept),
              filterReset: t(Strings.reset),
              filterSearchPlaceholder: t(Strings.search),
              filterTitle: t(Strings.filter),
              selectAll: t(Strings.selectCurrentPage),
              selectInvert: t(Strings.invertSelection),
              selectionAll: t(Strings.selectAll),
              sortTitle: t(Strings.sort),
              triggerDesc: t(Strings.sortDesc),
              triggerAsc: t(Strings.sortAsc),
              cancelSort: t(Strings.cancelSort)
            }}
            scroll={Constants.TABLE_SCROLL_CONFIG}
          />
        </div>
      )}
      
      {openPopoverId && (
        <div 
          className="fixed shadow-lg rounded-md bg-white z-50 p-4 border"
          style={Constants.POSITION_POPUP_STYLE}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-blue-600">{t(Strings.assignedUsers)}</div>
            <Button 
              type="text" 
              size="small" 
              onClick={() => setOpenPopoverId(null)}
            >
              ×
            </Button>
          </div>
          <PositionUsers positionId={openPopoverId} />
        </div>
      )}
      
      <LevelTreeModal 
        isVisible={isTreeModalVisible}
        onClose={hideTreeModal}
        siteId={siteId}
        siteName={siteName}
        onSelectLevel={handleLevelSelect}
      />
      
      <RegisterPositionForm 
        form={positionForm} 
        levelData={selectedLevel}
        isVisible={isPositionFormVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
      />

      <UpdatePositionForm
        form={updateForm}
        position={selectedPosition}
        isVisible={isUpdateFormVisible}
        onCancel={handleUpdateCancel}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default PositionsPage;
