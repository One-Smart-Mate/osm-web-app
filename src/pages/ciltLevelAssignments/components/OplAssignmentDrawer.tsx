import React, { useState } from "react";
import {
  Drawer,
  Button,
  Spin,
  Select,
  Typography,
  notification,
  Row,
  Col,
  Card,
  Empty,
} from "antd";

import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { useGetOplMstrBySiteMutation } from "../../../services/cilt/oplMstrService";
import { useGetOplTypesMutation } from "../../../services/oplTypesService";
import Strings from "../../../utils/localizations/Strings";
import { CaretRightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface OplAssignmentDrawerProps {
  isVisible: boolean;
  siteId: string | number;
  placement: "right" | "bottom";
  onClose: () => void;
  onAssign: (payload: any) => Promise<void>;
  selectedNode: any;
  isSubmitting?: boolean;
}

const OplAssignmentDrawer: React.FC<OplAssignmentDrawerProps> = ({
  isVisible,
  siteId,
  placement,
  onClose,
  onAssign,
  selectedNode,
  isSubmitting = false,
}) => {
  const [selectedOpl, setSelectedOpl] = useState<OplMstr | null>(null);
  const [getOplMstrBySite, { data: opls, isLoading: isLoadingOpls }] =
    useGetOplMstrBySiteMutation();
  const [getOplTypes] = useGetOplTypesMutation();
  const [oplTypesMap, setOplTypesMap] = useState<{ [key: number]: string }>({});
  const [oplDetailsVisible, setOplDetailsVisible] = useState(false);
  const [currentOplDetails, setCurrentOplDetails] = useState<any[]>([]);
  const [oplDropdownOpen, setOplDropdownOpen] = useState(false);

  React.useEffect(() => {
    if (isVisible && siteId) {
      fetchOpls();
      fetchOplTypes();
    }
  }, [isVisible, siteId]);

  const fetchOpls = async () => {
    try {
      await getOplMstrBySite(siteId.toString());
    } catch (error) {
      console.error("Error fetching OPLs:", error);
      notification.error({
        message: Strings.error,
        description: Strings.oplErrorLoadingDetails,
      });
    }
  };

  const fetchOplTypes = async () => {
    try {
      const response = await getOplTypes().unwrap();
      const typesMap = Array.isArray(response) 
        ? response.reduce((acc, type) => {
            if (type.documentType) {
              acc[type.id] = type.documentType;
            }
            return acc;
          }, {} as { [key: number]: string })
        : {};
      setOplTypesMap(typesMap);
    } catch (error) {
      console.error("Error fetching OPL types:", error);
      setOplTypesMap({});
    }
  };

  const getOplTypeName = (oplTypeId: number | null | undefined): string => {
    if (!oplTypeId || !oplTypesMap[oplTypeId]) {
      return Strings.oplFormNotAssigned;
    }
    return oplTypesMap[oplTypeId];
  };

  const handleSubmit = async () => {
    if (!selectedOpl) {
      notification.warning({
        message: Strings.warning,
        description: Strings.oplErrorSelectingOpl,
      });
      return;
    }

    try {
      const numericOplId = Number(selectedOpl.id);
      const numericLevelId = Number(selectedNode.id);

      if (isNaN(numericOplId)) {
        throw new Error(Strings.oplErrorInvalidOplId);
      }
      if (isNaN(numericLevelId)) {
        throw new Error(Strings.oplErrorInvalidLevelId);
      }

      const numericSiteId = Number(siteId);
      
      if (isNaN(numericSiteId)) {
        throw new Error(Strings.noValidSiteId);
      }
      
      const payload = {
        oplId: numericOplId,
        levelId: numericLevelId,
        siteId: numericSiteId,
        createdAt: new Date().toISOString()
      };

      await onAssign(payload);

      // Show success notification
      notification.success({
        message: Strings.success,
        description: Strings.oplAssignmentSuccess,
      });

      // Reset state - drawer closing is handled by parent
      setSelectedOpl(null);
    } catch (error) {
      console.error("Error in assignment:", error);

      let errorMessage = Strings.oplErrorAssigning;

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object"
      ) {
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

  const viewOplDetails = (opl: OplMstr) => {
    setCurrentOplDetails((opl as any).details || []);
    setOplDetailsVisible(true);
  };

  const renderOplDetails = () => {
    if (!currentOplDetails || currentOplDetails.length === 0) {
      return <Empty description={Strings.oplNoDetails} />;
    }

    return (
      <div className="space-y-4">
        {currentOplDetails.map((detail, index) => (
          <Card
            key={index}
            size="small"
            title={`Paso ${index + 1}: ${
              detail.type.charAt(0).toUpperCase() + detail.type.slice(1)
            }`}
          >
            {detail.type === "texto" && <div>{detail.text}</div>}
            {detail.type === "imagen" && (
              <div className="flex flex-col items-center">
                <img
                  src={detail.mediaUrl}
                  alt="Imagen"
                  style={{
                    maxHeight: "200px",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
                {detail.text && <div className="mt-2">{detail.text}</div>}
              </div>
            )}
            {detail.type === "video" && (
              <div className="flex flex-col items-center">
                <video
                  src={detail.mediaUrl}
                  controls
                  style={{ maxHeight: "200px", maxWidth: "100%" }}
                />
                {detail.text && <div className="mt-2">{detail.text}</div>}
              </div>
            )}
            {detail.type === "pdf" && (
              <div>
                <a
                  href={detail.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button type="primary">Ver PDF</Button>
                </a>
                {detail.text && <div className="mt-2">{detail.text}</div>}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Drawer
        title={`${Strings.assignOplLevel} ${Strings.to} ${
          selectedNode?.name || ""
        }`}
        placement={placement}
        onClose={onClose}
        open={isVisible}
        width={placement === "right" ? 500 : "100%"}
        height={placement === "bottom" ? 500 : "100%"}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <Button onClick={onClose}>{Strings.cancel}</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!selectedOpl}
            >
              {Strings.assign}
            </Button>
          </div>
        }
      >
        {isLoadingOpls ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Text strong>{Strings.level}:</Text>
              <div className="p-2 border border-gray-300 rounded mt-1">
                {selectedNode?.name || Strings.level}
              </div>
            </div>

            <div>
              <Text strong>OPL:</Text>
              <Row gutter={8} align="middle">
                <Col flex="auto">
                  <Select
                    placeholder={Strings.selectOpl}
                    className="w-full mt-1"
                    loading={isLoadingOpls}
                    value={selectedOpl?.id}
                    onChange={(value) => {
                      const opl = opls?.find((p) => p.id === value);
                      setSelectedOpl(opl || null);
                      setOplDropdownOpen(false);
                    }}
                    showSearch
                    optionFilterProp="label"
                    open={oplDropdownOpen}
                    onDropdownVisibleChange={(open) => {
                      if (!oplDetailsVisible) {
                        setOplDropdownOpen(open);
                      }
                    }}
                    dropdownRender={(menu) => <>{menu}</>}
                    optionLabelProp="label"
                  >
                    {opls?.map((opl) => (
                      <Select.Option
                        key={opl.id}
                        value={opl.id}
                        label={`${opl.title} (${getOplTypeName(opl.oplTypeId)})`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{`${opl.title} (${getOplTypeName(opl.oplTypeId)})`}</span>
                          <Button
                            type="primary"
                            size="small"
                            style={{ marginLeft: "8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOplDropdownOpen(false);
                              viewOplDetails(opl);
                            }}
                          >
                            {Strings.viewDetails}
                          </Button>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {selectedOpl && (
              <div className="mt-4">
                <Card title={Strings.selectedOplInformation} size="small">
                  <p>
                    <strong>{Strings.title}:</strong> {selectedOpl.title}
                  </p>
                  <p>
                    <strong>{Strings.objective}:</strong>{" "}
                    {selectedOpl.objetive || Strings.notSpecified}
                  </p>
                  <p>
                    <strong>{Strings.type}:</strong>{" "}
                    {getOplTypeName(selectedOpl.oplTypeId)}
                  </p>
                  <p>
                    <strong>{Strings.creator}:</strong>{" "}
                    {selectedOpl.creatorName || Strings.notSpecified}
                  </p>
                  <p>
                    <strong>{Strings.reviewer}:</strong>{" "}
                    {selectedOpl.reviewerName || Strings.notSpecified}
                  </p>
                  <p>
                    <strong>{Strings.numberOfSteps}:</strong>{" "}
                    {(selectedOpl as any).details?.length || 0}
                  </p>
                  <Button
                    type="link"
                    icon={<CaretRightOutlined />}
                    onClick={() => viewOplDetails(selectedOpl)}
                  >
                    {Strings.viewDetails}
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        title={`${Strings.oplDetails}: ${selectedOpl?.title || ""}`}
        placement={placement === "right" ? "right" : "bottom"}
        onClose={() => setOplDetailsVisible(false)}
        open={oplDetailsVisible}
        width={placement === "right" ? 600 : "100%"}
        height={placement === "bottom" ? 600 : "100%"}
        zIndex={1050}
      >
        {renderOplDetails()}
      </Drawer>
    </>
  );
};

export default OplAssignmentDrawer;
