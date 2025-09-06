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
  Image,
} from "antd";

import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { useGetOplMstrBySiteMutation } from "../../../services/cilt/oplMstrService";
import { useGetOplTypesMutation } from "../../../services/oplTypesService";
import { useGetOplDetailsByOplMutation } from "../../../services/cilt/oplDetailsService";
import Strings from "../../../utils/localizations/Strings";
import { CaretRightOutlined, FileOutlined } from "@ant-design/icons";

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
  const [selectedOplForDetails, setSelectedOplForDetails] = useState<OplMstr | null>(null);
  const [getOplMstrBySite, { data: opls, isLoading: isLoadingOpls }] =
    useGetOplMstrBySiteMutation();
  const [getOplTypes] = useGetOplTypesMutation();
  const [getOplDetailsByOpl, { isLoading: isLoadingOplDetails }] = useGetOplDetailsByOplMutation();
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

  const viewOplDetails = async (opl: OplMstr) => {
    setSelectedOplForDetails(opl);
    setOplDetailsVisible(true);
    
    try {
      // Fetch OPL details from the API
      const details = await getOplDetailsByOpl(String(opl.id)).unwrap();
      
      if (details && details.length > 0) {
        // Sort details by order
        const sortedDetails = [...details].sort((a, b) => a.order - b.order);
        setCurrentOplDetails(sortedDetails);
      } else {
        // No details found - this is normal, not an error
        setCurrentOplDetails([]);
      }
    } catch (error) {
      console.error('Error fetching OPL details:', error);
      setCurrentOplDetails([]);
      // Only show error notification if it's an actual API error, not empty results
      if (error && typeof error === 'object' && 'status' in error && error.status !== 404) {
        notification.error({
          message: Strings.error,
          description: "Error al cargar los detalles del OPL",
        });
      }
    }
  };

  // Get image URL helper function
  const getOplImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return url.startsWith('/') ? `https:${url}` : `https://${url}`;
  };

  const renderOplDetails = () => {
    if (!selectedOplForDetails) {
      return <Empty description={Strings.oplNoDetails} />;
    }

    return (
      <div>
        {/* OPL General Information */}
        <Row gutter={[16, 8]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card size="small" title={Strings.objective}>
              <Typography.Text>{selectedOplForDetails.objetive || Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title={Strings.creator}>
              <Typography.Text>{selectedOplForDetails.creatorName || Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title={Strings.reviewer}>
              <Typography.Text>{selectedOplForDetails.reviewerName || Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Created Date">
              <Typography.Text>{selectedOplForDetails.createdAt ? new Date(selectedOplForDetails.createdAt).toLocaleDateString() : Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title={Strings.type}>
              <Typography.Text>{getOplTypeName(selectedOplForDetails.oplTypeId)}</Typography.Text>
            </Card>
          </Col>
        </Row>

        {/* OPL Steps/Details */}
        <Typography.Title level={4}>{Strings.oplDetails}</Typography.Title>
        
        {isLoadingOplDetails ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Typography.Text type="secondary">Cargando detalles del OPL...</Typography.Text>
            </div>
          </div>
        ) : currentOplDetails && currentOplDetails.length > 0 ? (
          <Row gutter={[16, 16]}>
            {currentOplDetails.map((detail: any, index: number) => (
              <Col xs={24} md={12} key={detail.id || detail.order || index}>
                <Card 
                  size="small"
                  title={`Paso ${detail.order || (index + 1)}: ${detail.type ? detail.type.charAt(0).toUpperCase() + detail.type.slice(1) : 'Contenido'}`}
                  style={{ 
                    height: '100%',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px'
                  }}
                >
                  {detail.text && (
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                      <Typography.Paragraph>{detail.text}</Typography.Paragraph>
                    </div>
                  )}
                  
                  {detail.mediaUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                      {detail.type === 'imagen' ? (
                        <Image 
                          src={getOplImageUrl(detail.mediaUrl)}
                          alt={`Contenido ${detail.order || (index + 1)}`}
                          style={{ 
                            width: '400px', 
                            height: '300px', 
                            objectFit: 'contain',
                            maxWidth: '100%' 
                          }}
                        />
                      ) : detail.type === 'video' ? (
                        <video 
                          controls 
                          src={detail.mediaUrl} 
                          style={{ 
                            width: '400px', 
                            maxWidth: '100%', 
                            height: '300px', 
                            objectFit: 'contain' 
                          }}
                        />
                      ) : (
                        <a href={detail.mediaUrl} target="_blank" rel="noopener noreferrer">
                          <Button type="primary" icon={<FileOutlined />}>{Strings.viewDocument}</Button>
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Empty 
              description={
                <div>
                  <Typography.Text type="secondary">
                    {Strings.oplNoDetails || "No hay pasos disponibles para este OPL"}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    Este OPL no tiene pasos configurados
                  </Typography.Text>
                </div>
              } 
            />
          </div>
        )}
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
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%'
                        }}>
                          <span style={{ 
                            flex: '1', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {`${opl.title} (${getOplTypeName(opl.oplTypeId)})`}
                          </span>
                          <Button
                            type="primary"
                            size="small"
                            style={{ 
                              flexShrink: 0,
                              minWidth: 'auto'
                            }}
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
        title={`${Strings.oplDetails}: ${selectedOplForDetails?.title || ""}`}
        placement={placement === "right" ? "right" : "bottom"}
        onClose={() => {
          setOplDetailsVisible(false);
          setSelectedOplForDetails(null);
          setCurrentOplDetails([]);
        }}
        open={oplDetailsVisible}
        width={placement === "right" ? 800 : "100%"}
        height={placement === "bottom" ? 700 : "100%"}
        zIndex={1050}
      >
        {renderOplDetails()}
      </Drawer>
    </>
  );
};

export default OplAssignmentDrawer;
