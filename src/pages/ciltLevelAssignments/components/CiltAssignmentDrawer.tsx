import React, { useState } from "react";
import {
  Drawer,
  Button,
  Space,
  Select,
  Row,
  Col,
  Typography,
  Spin,
  List,
  notification,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

import { Position } from "../../../data/postiions/positions";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { useGetPositionsBySiteIdQuery, useGetPositionUsersQuery } from "../../../services/positionService";
import { Responsible } from "../../../data/user/user";
import { useGetCiltMstrBySiteQuery } from "../../../services/cilt/ciltMstrService";
import Strings from "../../../utils/localizations/Strings";
import PositionDetailsModal from "./PositionDetailsModal";
import CiltMstrDetailsModal from "./CiltMstrDetailsModal";

const { Text } = Typography;

// Componente para mostrar los usuarios de una posición
const PositionUsers = ({ positionId }: { positionId: string }) => {
  const { data: users = [], isLoading } = useGetPositionUsersQuery(positionId, {
    refetchOnMountOrArgChange: true
  });

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (!users.length) {
    return <Text type="secondary">{Strings.noAssignedUsers || "No hay usuarios asignados"}</Text>;
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

interface CiltAssignmentDrawerProps {
  isVisible: boolean;
  siteId: string | number;
  placement: "right" | "bottom";
  onClose: () => void;
  onAssign: (payload: any) => Promise<void>;
  selectedNode: any;
  drawerType: "cilt-position" | "opl" | "details";
  isSubmitting?: boolean;
  onSuccess?: () => void; // Callback to refresh the tree
}

const CiltAssignmentDrawer: React.FC<CiltAssignmentDrawerProps> = ({
  isVisible,
  siteId,
  placement,
  onClose,
  onAssign,
  selectedNode,
  drawerType,
  isSubmitting = false,
  onSuccess,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [selectedCiltMstr, setSelectedCiltMstr] = useState<CiltMstr | null>(
    null
  );

  const [positionDetailsVisible, setPositionDetailsVisible] = useState(false);
  const [positionToView, setPositionToView] = useState<Position | null>(null);
  const [showPositionUsers, setShowPositionUsers] = useState(false);

  const [ciltMstrDetailsVisible, setCiltMstrDetailsVisible] = useState(false);
  const [ciltMstrToView, setCiltMstrToView] = useState<CiltMstr | null>(null);

  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  const [ciltDropdownOpen, setCiltDropdownOpen] = useState(false);

  const { data: positions, isLoading: isLoadingPositions } =
    useGetPositionsBySiteIdQuery(siteId.toString());

  const { data: ciltMstrs, isLoading: isLoadingCiltMstrs } =
    useGetCiltMstrBySiteQuery(siteId.toString());

  const getDrawerTitle = () => {
    switch (drawerType) {
      case "cilt-position":
        return `${Strings.assignPositionCiltMstrLevel} ${Strings.to} ${
          selectedNode?.name || ""
        }`;
      case "opl":
        return `${Strings.assignOplLevel} ${Strings.to} ${
          selectedNode?.name || ""
        }`;
      case "details":
        return `${Strings.details}: ${selectedNode?.name || ""}`;
      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedPosition || !selectedCiltMstr) {
      notification.warning({
        message: Strings.warning,
        description: Strings.selectPositionAndCilt,
      });
      return;
    }

    try {
      if (!selectedNode || !selectedNode.id) {
        console.error("No hay un nodo seleccionado o el nodo no tiene ID", selectedNode);
        throw new Error(Strings.noValidLevelId);
      }

      console.log("selectedNode en handleSubmit:", selectedNode);

      
      const numericSiteId = Number(siteId);
      const numericCiltMstrId = Number(selectedCiltMstr.id);
      const numericPositionId = Number(selectedPosition.id);
      
      
      let nodeId = String(selectedNode.id);
      let levelIdValue = nodeId.replace(/[^0-9]/g, '');
      
      if (!levelIdValue) {
        levelIdValue = selectedNode.levelId || selectedNode.realId || "0";
        console.warn("No se pudo extraer un ID numérico válido, usando alternativa:", levelIdValue);
      }
      
      const numericLevelId = Number(levelIdValue);
      
      
      console.log("Datos del nodo seleccionado completo:", JSON.stringify(selectedNode));
      console.log("ID original del nodo:", nodeId);
      console.log("ID del nivel limpio:", levelIdValue);
      console.log("ID del nivel convertido a número:", numericLevelId);
      
      
      if (isNaN(numericSiteId) || numericSiteId <= 0) {
        throw new Error(Strings.noValidSiteId);
      }
      if (isNaN(numericCiltMstrId) || numericCiltMstrId <= 0) {
        throw new Error(Strings.noValidCiltMstrId);
      }
      if (isNaN(numericPositionId) || numericPositionId <= 0) {
        throw new Error(Strings.noValidPositionId);
      }
      if (isNaN(numericLevelId) || numericLevelId <= 0) {
        throw new Error(Strings.noValidLevelId);
      }
      
      const payload = {
        siteId: numericSiteId,
        ciltMstrId: numericCiltMstrId,
        positionId: numericPositionId,
        levelId: numericLevelId,
        status: "A",
        createdAt: new Date().toISOString()
      };

      console.log("Payload enviado:", payload);

      await onAssign(payload);

      // Success notification is now handled by the parent component
      setSelectedPosition(null);
      setSelectedCiltMstr(null);

      // Call the success callback to refresh the tree
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error in assignment:", error);
      
      let errorMessage = Strings.errorOccurred;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object') {
        
        const data = error.data as any;
        if (data.message) {
          errorMessage = data.message;
        }
      }
      
      notification.error({
        message: Strings.error,
        description: errorMessage,
      });
    }
  };

  const renderContent = () => {
    switch (drawerType) {
      case "cilt-position":
        return (
          <div className="space-y-4">
            <div>
              <Text strong>{Strings.level}:</Text>
              <div className="p-2 border border-gray-300 rounded mt-1">
                {selectedNode?.name || Strings.level}
              </div>
              {showPositionUsers && selectedPosition && (
                <div className="mt-3 border-t pt-2">
                  <div className="font-medium text-blue-600 mb-2">
                    {Strings.assignedUsers || "Usuarios asignados"}
                  </div>
                  <PositionUsers positionId={selectedPosition.id.toString()} />
                </div>
              )}
            </div>

            <div>
              <Text strong>{Strings.ciltMstrPositionLabel}:</Text>
              <Row gutter={8} align="middle">
                <Col flex="auto">
                  <Select
                    placeholder={Strings.selectPosition}
                    className="w-full mt-1"
                    loading={isLoadingPositions}
                    value={selectedPosition?.id}
                    onChange={(value) => {
                      const position = positions?.find((p) => p.id === value);
                      setSelectedPosition(position || null);

                      setPositionDropdownOpen(false);
                    }}
                    showSearch
                    optionFilterProp="label"
                    open={positionDropdownOpen}
                    onDropdownVisibleChange={(open) => {
                      if (!positionDetailsVisible) {
                        setPositionDropdownOpen(open);
                      }
                    }}
                    dropdownRender={(menu) => <>{menu}</>}
                    optionLabelProp="label"
                  >
                    {positions?.map((position) => (
                      <Select.Option
                        key={position.id}
                        value={position.id}
                        label={`${position.name} - ${position.areaName}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{`${position.name} - ${position.areaName}`}</span>
                          <Button
                            type="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();

                              setPositionDropdownOpen(true);

                              setPositionToView(position);
                              setPositionDetailsVisible(true);
                            }}
                          >
                            {Strings.ciltCardListViewDetailsButton}
                          </Button>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                {selectedPosition && (
                  <Col flex="none">
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          setPositionToView(selectedPosition);
                          setPositionDetailsVisible(true);
                        }}
                      >
                        {Strings.ciltCardListViewDetailsButton}
                      </Button>
                      <Button
                        type="default"
                        size="small"
                        onClick={() => setShowPositionUsers(!showPositionUsers)}
                        className={showPositionUsers ? "text-blue-500" : ""}
                      >
                        {Strings.users || "Usuarios"}
                      </Button>
                    </Space>
                  </Col>
                )}
              </Row>
            </div>

            <div>
              <Text strong>{Strings.ciltMstr}:</Text>
              <Row gutter={8} align="middle">
                <Col flex="auto">
                  <Select
                    placeholder={Strings.selectCiltMstr}
                    className="w-full mt-1"
                    loading={isLoadingCiltMstrs}
                    value={selectedCiltMstr?.id}
                    onChange={(value) => {
                      const ciltMstr = ciltMstrs?.find((c) => c.id === value);
                      setSelectedCiltMstr(ciltMstr || null);

                      setCiltDropdownOpen(false);
                    }}
                    showSearch
                    optionFilterProp="label"
                    open={ciltDropdownOpen}
                    onDropdownVisibleChange={(open) => {
                      if (!ciltMstrDetailsVisible) {
                        setCiltDropdownOpen(open);
                      }
                    }}
                    dropdownRender={(menu) => <>{menu}</>}
                    optionLabelProp="label"
                  >
                    {ciltMstrs?.map((ciltMstr) => (
                      <Select.Option
                        key={ciltMstr.id}
                        value={ciltMstr.id}
                        label={ciltMstr.ciltName}
                      >
                        <div className="flex justify-between items-center">
                          <span>{ciltMstr.ciltName}</span>
                          <Button
                            type="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();

                              setCiltDropdownOpen(true);

                              setCiltMstrToView(ciltMstr);
                              setCiltMstrDetailsVisible(true);
                            }}
                          >
                            {Strings.ciltCardListViewDetailsButton}
                          </Button>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                {selectedCiltMstr && (
                  <Col flex="none">
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        setCiltMstrToView(selectedCiltMstr);
                        setCiltMstrDetailsVisible(true);
                      }}
                    >
                      {Strings.ciltCardListViewDetailsButton}
                    </Button>
                  </Col>
                )}
              </Row>
            </div>

            <div className="flex justify-end mt-6">
              <Space>
                <Button onClick={onClose}>{Strings.cancel}</Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={!selectedPosition || !selectedCiltMstr}
                >
                  {Strings.save}
                </Button>
              </Space>
            </div>
          </div>
        );

      case "opl":
        return (
          <div className="flex justify-center items-center h-64">
            <Text>{Strings.featureUnderDevelopment}</Text>
          </div>
        );

      case "details":
        return (
          <div className="flex justify-center items-center h-64">
            <Text>{Strings.featureUnderDevelopment}</Text>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      title={getDrawerTitle()}
      placement={placement}
      height={placement === "bottom" ? "50vh" : undefined}
      width={placement === "right" ? 500 : undefined}
      onClose={onClose}
      open={isVisible}
      destroyOnHidden
      closable={true}
      className="drawer-responsive"
      mask={false}
      maskClosable={false}
    >
      {(isLoadingPositions || isLoadingCiltMstrs) &&
      drawerType === "cilt-position" ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        renderContent()
      )}

      {/* Modales de detalles */}
      <PositionDetailsModal
        visible={positionDetailsVisible}
        position={positionToView}
        onCancel={() => {
          setPositionDetailsVisible(false);

          setPositionDropdownOpen(true);
        }}
      />

      <CiltMstrDetailsModal
        visible={ciltMstrDetailsVisible}
        ciltMstr={ciltMstrToView}
        onCancel={() => {
          setCiltMstrDetailsVisible(false);

          setCiltDropdownOpen(true);
        }}
      />
    </Drawer>
  );
};

export default CiltAssignmentDrawer;
