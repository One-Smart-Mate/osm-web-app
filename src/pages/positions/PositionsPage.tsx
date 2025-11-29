import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProceduresModal from "./components/ProceduresModal";
import PositionCard from "./components/PositionCard";
import PositionUsersList from "./components/PositionUsersList";
import {
  Form,
  List,
} from "antd";
import RegisterPositionForm from "./components/RegisterPositionForm";
import UpdatePositionForm from "./components/UpdatePositionForm";
import { useGetSiteMutation } from "../../services/siteService";
import {
  useGetPositionsBySiteIdQuery,
} from "../../services/positionService";
import { Position } from "../../data/postiions/positions";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import RefreshButton from "../components/RefreshButton";
import PaginatedList from "../components/PaginatedList";

const PositionsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProceduresModalOpen, setIsProceduresModalOpen] = useState(false);
  const [isPositionFormVisible, setIsPositionFormVisible] = useState(false);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [usersListOpen, setUsersListOpen] = useState<string | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [positionForm] = Form.useForm();
  const [updateForm] = Form.useForm();
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

  const filteredPositions = useMemo(() => {
    const positionsArray = Array.isArray(positions) ? positions : [];

    if (positionsArray.length === 0) {
      return [];
    }

    if (!searchTerm) {
      return positionsArray;
    }

    return positionsArray.filter(
      (position) =>
        position.areaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [positions, searchTerm]);

  useEffect(() => {
    if (siteId) {
      getSite(siteId);
    }
  }, [siteId, getSite]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
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

  const handleViewUsers = (position: Position, buttonElement: HTMLElement) => {
    const positionId = position.id.toString();
    if (usersListOpen === positionId) {
      setUsersListOpen(null);
      setAnchorElement(null);
      setSelectedPosition(null);
    } else {
      setUsersListOpen(positionId);
      setAnchorElement(buttonElement);
      setSelectedPosition(position);
    }
  };

  const handleCloseUsersList = () => {
    setUsersListOpen(null);
    setAnchorElement(null);
    setSelectedPosition(null);
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
          <div className="flex justify-end mb-2">
            <RefreshButton onRefresh={refetchPositions} isLoading={isLoadingPositions} />
          </div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={filteredPositions}
            renderItem={(item: Position) => (
              <List.Item key={item.id}>
                <PositionCard
                  position={item}
                  onViewDetails={(position) => {
                    setSelectedPosition(position);
                    setIsProceduresModalOpen(true);
                  }}
                  onEdit={handleEditPosition}
                  onViewUsers={handleViewUsers}
                  isUsersModalOpen={usersListOpen === item.id.toString()}
                />
              </List.Item>
            )}
            loading={isLoadingPositions}
          />

          {/* Users List Drilldown Modal */}
          <PositionUsersList
            positionId={usersListOpen}
            positionName={selectedPosition?.name}
            onClose={handleCloseUsersList}
            anchorElement={anchorElement}
          />

          <RegisterPositionForm
            form={positionForm}
            levelData={{
              siteId: siteId,
              siteName: siteName,
              siteType: 'site', 
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
