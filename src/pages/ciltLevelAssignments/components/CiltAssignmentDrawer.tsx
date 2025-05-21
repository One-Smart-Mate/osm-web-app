import React, { useState } from "react";
import {
  Drawer,
  Button,
  Spin,
  Select,
  Space,
  Typography,
  notification,
  Row,
  Col,
} from "antd";

import { Position } from "../../../data/postiions/positions";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CreateCiltMstrPositionLevelDTO } from "../../../data/cilt/assignaments/ciltMstrPositionsLevels";
import { useGetPositionsBySiteIdQuery } from "../../../services/positionService";
import { useGetCiltMstrBySiteQuery } from "../../../services/cilt/ciltMstrService";
import Strings from "../../../utils/localizations/Strings";
import PositionDetailsModal from "./PositionDetailsModal";
import CiltMstrDetailsModal from "./CiltMstrDetailsModal";

const { Text } = Typography;

interface CiltAssignmentDrawerProps {
  isVisible: boolean;
  siteId: string | number;
  placement: "right" | "bottom";
  onClose: () => void;
  onAssign: (payload: CreateCiltMstrPositionLevelDTO) => Promise<void>;
  selectedNode: any;
  drawerType: "cilt-position" | "opl" | "details";
  isSubmitting?: boolean;
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
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [selectedCiltMstr, setSelectedCiltMstr] = useState<CiltMstr | null>(
    null
  );

  const [positionDetailsVisible, setPositionDetailsVisible] = useState(false);
  const [ciltMstrDetailsVisible, setCiltMstrDetailsVisible] = useState(false);
  const [positionToView, setPositionToView] = useState<Position | null>(null);
  const [ciltMstrToView, setCiltMstrToView] = useState<CiltMstr | null>(null);

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
        message: Strings.error,
        description: Strings.errorOccurred,
      });
      return;
    }

    try {
      const payload = new CreateCiltMstrPositionLevelDTO(
        Number(siteId),
        selectedCiltMstr.id,
        selectedPosition.id,
        Number(selectedNode.id),
        "A"
      );

      console.log("Payload enviado:", {
        siteId: Number(siteId),
        ciltMstrId: selectedCiltMstr.id,
        positionId: selectedPosition.id,
        levelId: Number(selectedNode.id),
        status: "A",
      });

      await onAssign(payload);

      setSelectedPosition(null);
      setSelectedCiltMstr(null);

      onClose();
    } catch (error) {
      console.error("Error in assignment:", error);
      notification.error({
        message: Strings.error,
        description: Strings.errorOccurred,
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
                    }}
                    showSearch
                    optionFilterProp="label"
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
                    }}
                    showSearch
                    optionFilterProp="label"
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
      destroyOnClose
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
        onCancel={() => setPositionDetailsVisible(false)}
      />

      <CiltMstrDetailsModal
        visible={ciltMstrDetailsVisible}
        ciltMstr={ciltMstrToView}
        onCancel={() => setCiltMstrDetailsVisible(false)}
      />
    </Drawer>
  );
};

export default CiltAssignmentDrawer;
