import React, { useState, useEffect } from "react";
import { Form, message } from "antd";
import { useLocation } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import CiltCardList from "./components/CiltCardList";
import { useGetSiteMutation } from "../../services/siteService";
import CreateCiltModal from "./components/CreateCiltModal";

const CiltProceduresPage = (): React.ReactElement => {
  const location = useLocation();
  const siteId = location.state?.siteId || "";

  const [isCiltFormVisible, setIsCiltFormVisible] = useState(false);
  const [ciltForm] = Form.useForm();
  const [getSite] = useGetSiteMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (siteId) {
      setIsLoading(true);
      getSite(siteId)
        .unwrap()
        .finally(() => setIsLoading(false));
    }
  }, [siteId, getSite]);

  const showCreateCiltModal = () => {
    if (!siteId) {
      message.warning(Strings.requiredPosition);
      return;
    }
    setIsCiltFormVisible(true);
  };

  const handleCiltFormCancel = () => {
    setIsCiltFormVisible(false);
    ciltForm.resetFields();
  };

  const handleCiltFormSuccess = () => {
    setIsCiltFormVisible(false);
    ciltForm.resetFields();

    message.success(Strings.ciltMstrCreateSuccess);

    window.location.reload();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <>
      <MainContainer
        title={Strings.ciltProceduresSB}
        description={Strings.empty}
        content={<CiltCardList searchTerm={searchTerm} />}
        enableSearch={true}
        enableCreateButton={true}
        onCreateButtonClick={showCreateCiltModal}
        onSearchChange={handleSearch}
        isLoading={isLoading}
      />

      {/* Create CILT Modal */}
      <CreateCiltModal
        visible={isCiltFormVisible}
        position={null}
        form={ciltForm}
        onCancel={handleCiltFormCancel}
        onSuccess={handleCiltFormSuccess}
      />
    </>
  );
};

export default CiltProceduresPage;
