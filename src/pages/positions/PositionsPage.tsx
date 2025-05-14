import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProceduresModal from "./components/ProceduresModal";
import {
  Button,
  Form,
  Tag,
  Spin,
  List,
  Typography,
  Card,
  Modal,
} from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";
import RegisterPositionForm from "./components/RegisterPositionForm";
import UpdatePositionForm from "./components/UpdatePositionForm";
import CreateCiltForm from "./components/CreateCiltForm";
import { useGetSiteMutation } from "../../services/siteService";
import {
  useGetPositionsBySiteIdQuery,
  useGetPositionUsersQuery,
} from "../../services/positionService";
import { Position } from "../../data/postiions/positions";
import { Responsible } from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import Constants from "../../utils/Constants";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../components/PaginatedList";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";

const { Text } = Typography;

const PositionsPage = () => {
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [isProceduresModalOpen, setIsProceduresModalOpen] = useState(false);
  const [isPositionFormVisible, setIsPositionFormVisible] = useState(false);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [isCiltFormVisible, setIsCiltFormVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [positionForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [ciltForm] = Form.useForm();
  const [getSite] = useGetSiteMutation();
  const { isIhAdmin } = useCurrentUser();

  const location = useLocation();
  const siteId = location.state?.siteId || "";
  const siteName = location.state?.siteName || "";

  const {
    data: positions = [],
    isLoading: isLoadingPositions,
    refetch: refetchPositions,
  } = useGetPositionsBySiteIdQuery(siteId, {
    skip: !siteId,
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
    if (!positions) return;

    const filtered = positions.filter(
      (position) =>
        position.areaName?.toLowerCase().includes(value.toLowerCase()) ||
        position.name?.toLowerCase().includes(value.toLowerCase()) ||
        position.description?.toLowerCase().includes(value.toLowerCase()) ||
        position.status?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPositions(filtered);
  };

  const handleFormCancel = () => {
    setIsPositionFormVisible(false);
    positionForm.resetFields();
  };

  const handleFormSuccess = () => {
    setIsPositionFormVisible(false);
    positionForm.resetFields();
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
    refetchPositions();
  };

  const handleCreateCilt = (position: Position) => {
    setSelectedPosition(position);
    setIsCiltFormVisible(true);
  };

  const handleCiltFormCancel = () => {
    setIsCiltFormVisible(false);
    setSelectedPosition(null);
  };

  const handlePopoverVisibleChange = (visible: boolean, positionId: string) => {
    setOpenPopoverId(visible ? positionId : null);
  };

  const PositionUsers = ({ positionId }: { positionId: string }) => {
    const { data: users = [], isLoading, refetch } =
      useGetPositionUsersQuery(positionId, {
        refetchOnMountOrArgChange: true
      });

    useEffect(() => {
      if (openPopoverId === positionId) {
        refetch();
      }
    }, [openPopoverId, positionId, refetch]);

    if (isLoading) {
      return <Spin size="small" />;
    }

    if (!users.length) {
      return <Text type="secondary">{Strings.noAssignedUsers}</Text>;
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

  const renderStatusTag = (status: string) => {
    if (status === Constants.STATUS_ACTIVE) {
      return <Tag color="green">{Strings.active}</Tag>;
    } else if (status === Constants.STATUS_SUSPENDED) {
      return <Tag color="orange">{Strings.suspended}</Tag>;
    } else if (status === Constants.STATUS_CANCELED) {
      return <Tag color="red">{Strings.canceled}</Tag>;
    } else {
      return <Tag color="default">{status}</Tag>;
    }
  };

  return (
    <MainContainer
      title={siteName}
      description={Strings.positions}
      enableCreateButton={true}
      onCreateButtonClick={() => setIsPositionFormVisible(true)}
      enableBackButton={isIhAdmin()}
      enableSearch={true}
      onSearchChange={handleSearch}
      isLoading={isLoadingPositions}
      content={
        <div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={filteredPositions}
            renderItem={(item: Position) => (
              <List.Item key={item.id}>
                <Card
                  hoverable
                  className="w-full shadow-md"
                >
                  <Card.Meta
                    title={
                      <div className="flex justify-between items-center">
                        <div>{item.name}</div>
                      </div>
                    }
                    description={item.description}
                  />
                  <div className="mt-4">
                    <AnatomySection
                      title="Área"
                      label={item.areaName || "Sin área"}
                    />
                    <AnatomySection
                      title="Estado"
                      label={renderStatusTag(item.status)}
                    />
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateCilt(item);
                        }}
                        style={{ width: '100%', marginBottom: '8px' }}
                      >
                        {Strings.createCiltProcedure}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPosition(item);
                          setIsProceduresModalOpen(true);
                        }}
                        style={{ width: '100%' }}
                      >
                        Ver procedimientos
                      </Button>
                    </div>
                    <div className="flex space-x-2 mt-4 justify-center">
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPosition(item);
                        }}
                      >
                        {Strings.edit}
                      </Button>
                      <Button
                        type="default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        PDF
                      </Button>
                      <Button
                        type="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePopoverVisibleChange(
                            openPopoverId !== item.id.toString(),
                            item.id.toString()
                          );
                        }}
                        className={openPopoverId === item.id.toString() ? "text-blue-500" : ""}
                      >
                        {Strings.users}
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            loading={isLoadingPositions}
          />

          {openPopoverId && (
            <div
              className="fixed shadow-lg rounded-md bg-white z-50 p-4 border"
              style={Constants.POSITION_POPUP_STYLE}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-blue-600">
                  {Strings.assignedUsers}
                </div>
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

          <RegisterPositionForm
            form={positionForm}
            levelData={{
              siteId: siteId,
              siteName: siteName,
              siteType: 'site', // Valor predeterminado si no se conoce el tipo
              id: null,
              name: null,
              levelLocation: null
            }}
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

          {/* CILT Form Modal */}
          <Modal
            title={`${Strings.createCiltProcedureForPosition}: ${selectedPosition?.name || ''}`}
            open={isCiltFormVisible}
            onCancel={handleCiltFormCancel}
            footer={null}
            width={800}
            destroyOnHidden
          >
            {selectedPosition && (
              <div className="p-4">
                <CreateCiltForm 
                  form={ciltForm} 
                  position={selectedPosition}
                  onSuccess={handleCiltFormCancel}
                />
              </div>
            )}
          </Modal>

          <ProceduresModal
            isOpen={isProceduresModalOpen}
            onClose={() => setIsProceduresModalOpen(false)}
            positionId={selectedPosition?.id?.toString()}
            positionName={selectedPosition?.name}
          />
        </div>
      }
    />
  );
};

export default PositionsPage;
