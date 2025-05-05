import React, { useState } from "react";
import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CiltCardList from "./CiltCardList";
import SearchBar from "../../../components/common/SearchBar";
import Strings from "../../../utils/localizations/Strings";

const { Title } = Typography;

interface CiltProceduresProps {
  onCreateClick?: () => void;
}

const CiltProcedures: React.FC<CiltProceduresProps> = ({ onCreateClick }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="cilt-procedures-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          gap: "16px",
          padding: "12px 24px",
        }}
      >
        <div style={{ flex: 1, maxWidth: "300px" }}>
          <SearchBar
            placeholder={Strings.ciltProceduresSearchPlaceholder}
            onSearch={handleSearch}
          />
        </div>

        <Title level={3} style={{ flex: 2, margin: 0, textAlign: "center" }}>
          {/* {Strings.ciltMstrPageTitle} */}
        </Title>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick}
          >
            {Strings.createCiltProcedure}
          </Button>
        </div>
      </div>

      <CiltCardList searchTerm={searchTerm} />
    </div>
  );
};

export default CiltProcedures;
