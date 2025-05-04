import React from "react";
import { Table, Space, Button, Badge } from "antd";
import { EyeOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
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
  const columns: ColumnsType<OplMstr> = [
    {
      title: Strings.oplTableTitleColumn,
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: Strings.oplTableObjectiveColumn,
      dataIndex: "objetive",
      key: "objetive",
      ellipsis: true,
    },
    {
      title: Strings.oplTableTypeColumn,
      dataIndex: "oplType",
      key: "oplType",
      render: (type) => (
        <Badge
          color={type === "opl" ? "blue" : "green"}
          text={
            type === "opl" ? Strings.oplTableOplType : Strings.oplTableSopType
          }
        />
      ),
      filters: [
        { text: Strings.oplTableOplType, value: "opl" },
        { text: Strings.oplTableSopType, value: "sop" },
      ],
      onFilter: (value, record) => record.oplType === value,
    },
    {
      title: Strings.oplTableActionsColumn,
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            title={Strings.oplTableViewTooltip}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            title={Strings.oplTableEditTooltip}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onDetails(record)}
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
      pagination={{ pageSize: 10 }}
    />
  );
};

export default OplTable;
