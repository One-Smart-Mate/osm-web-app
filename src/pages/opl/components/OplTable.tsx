import React, { useEffect, useState } from "react";
import { Table, Space, Button, Badge } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { useGetOplTypesBySiteMutation } from "../../../services/oplTypesService";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import useCurrentUser from "../../../utils/hooks/useCurrentUser";
import { useAppSelector } from "../../../core/store";
import { selectSiteId } from "../../../core/genericReducer";

interface OplTableProps {
  opls: OplMstr[];
  onView: (_record: OplMstr) => void;
  onEdit: (_record: OplMstr) => void;
  onDetails: (_record: OplMstr) => void;
}

const OplTable: React.FC<OplTableProps> = ({
  opls,
  onView,
  onEdit,
  onDetails,
}) => {
  const [getOplTypesBySite] = useGetOplTypesBySiteMutation();
  const { user } = useCurrentUser();
  const siteIdFromSelector = useAppSelector(selectSiteId);
  // Resolve siteId from the site selector or the user's first site
  const siteId = siteIdFromSelector || user?.sites?.[0]?.id;
  const [oplTypesMap, setOplTypesMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchOplTypes();
  }, [siteId]);

  const fetchOplTypes = async () => {
    if (!siteId) {
      setOplTypesMap({});
      return;
    }
    try {
      const response = await getOplTypesBySite(Number(siteId)).unwrap();
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
      title: Strings.oplTableTimesUsedColumn,
      key: "timesUsed",
      align: "center",
      sorter: (a, b) =>
        ((a.directUsageCount ?? 0) + (a.ciltUsageCount ?? 0)) -
        ((b.directUsageCount ?? 0) + (b.ciltUsageCount ?? 0)),
      render: (_, record) => {
        const total =
          (record.directUsageCount ?? 0) + (record.ciltUsageCount ?? 0);
        return <Badge color={total > 0 ? "green" : "default"} text={total} />;
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
