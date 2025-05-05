import React, { useState, useEffect } from "react";
import { Form, message } from "antd";
import { useLocation } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import CiltProcedures from "./components/CiltProcedures";
import PositionSelectionModal from "./components/PositionSelectionModal";
import { Position } from "../../data/postiions/positions";
import { useGetSiteMutation } from "../../services/siteService";
import CreateCiltModal from "./components/CreateCiltModal";

const CiltProceduresPage = (): React.ReactElement => {
  const location = useLocation();
  const siteId = location.state?.siteId || "";

  const [isPositionModalVisible, setIsPositionModalVisible] = useState(false);
  const [isCiltFormVisible, setIsCiltFormVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [ciltForm] = Form.useForm();
  const [getSite] = useGetSiteMutation();

  useEffect(() => {
    if (siteId) {
      getSite(siteId);
    }
  }, [siteId, getSite]);

  const showPositionModal = () => {
    if (!siteId) {
      message.warning(Strings.requiredPosition);
      return;
    }
    setIsPositionModalVisible(true);
  };

  const handlePositionModalCancel = () => {
    setIsPositionModalVisible(false);
  };

  const handlePositionSelect = (position: Position) => {
    setSelectedPosition(position);
    setIsPositionModalVisible(false);
    setIsCiltFormVisible(true);
  };

  const handleCiltFormCancel = () => {
    setIsCiltFormVisible(false);
    setSelectedPosition(null);
    ciltForm.resetFields();
  };

  const handleCiltFormSuccess = () => {
    setIsCiltFormVisible(false);
    setSelectedPosition(null);
    ciltForm.resetFields();
    message.success(Strings.ciltMstrCreateSuccess);
  };

  return (
    <>
      <MainContainer
        content={<CiltProcedures onCreateClick={showPositionModal} />}
      />

      <PositionSelectionModal
        visible={isPositionModalVisible}
        siteId={siteId}
        onCancel={handlePositionModalCancel}
        onPositionSelect={handlePositionSelect}
      />

      {/* Create CILT Modal */}
      <CreateCiltModal
        visible={isCiltFormVisible}
        position={selectedPosition}
        form={ciltForm}
        onCancel={handleCiltFormCancel}
        onSuccess={handleCiltFormSuccess}
      />
    </>
  );
};

export default CiltProceduresPage;
