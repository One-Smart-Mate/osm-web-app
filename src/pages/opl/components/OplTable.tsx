import React, { useEffect, useState } from "react";
import { Table, Space, Button, Badge } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { useGetOplTypesMutation } from "../../../services/oplTypesService";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";

interface OplTableProps {
  opls: OplMstr[];
  onView: (record: OplMstr) => void;
  onEdit: (record: OplMstr) => void;
  onDetails: (record: OplMstr) => void;
}

const OplTable: React.FC<OplTableProps> = ({
  opls,
  onView,
  onEdit,
  onDetails,
}) => {
  const [getOplTypes] = useGetOplTypesMutation();
  const [oplTypesMap, setOplTypesMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchOplTypes();
  }, []);

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

  const columns: ColumnsType<OplMstr> = [
    {
      title: Strings.oplTableTitleColumn,
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: Strings.oplTableObjectiveColumn,
      dataIndex: "objetive",
      key: "objetive",
      ellipsis: false,
      responsive: ['lg'],
      width: 400,
      render: (text) => (
        <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {text}
        </div>
      ),
    },
    { 
      title: Strings.oplTableTypeColumn,
      dataIndex: "oplTypeId",
      key: "oplTypeId",
      render: (typeId) => {
        const typeName = typeId && oplTypesMap[typeId] ? oplTypesMap[typeId] : Strings.oplFormNotAssigned;
        return (
          <Badge
            color="blue"
            text={typeName}
          />
        );
      },
      responsive: ['sm'],
    },
    {
      title: Strings.oplTableActionsColumn,
      key: "action",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="default"
            size="small"
            onClick={() => onView(record)}
          >
            {Strings.oplTableViewButtonText}
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => onEdit(record)}
          >
            {Strings.oplTableEditButtonText}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => onDetails(record)}
            icon={<PlusOutlined />}
          >
            {Strings.addFiles}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={opls}
      rowKey="id"
      pagination={{ 
        pageSize: 100,
        showSizeChanger: true,
        pageSizeOptions: ["20", "50", "100", "200"]
      }}
      scroll={{ x: 'max-content' }}
      size="middle"
    />
  );
};

export default OplTable;
