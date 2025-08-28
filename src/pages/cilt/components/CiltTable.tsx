import React, { useState} from "react";
import { Table, Badge, Button, Space, Modal, notification, Tag } from "antd";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { getStatusAndText } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import CiltPDFButton from "./CiltPDFButton";
import { useDeleteCiltMstrMutation } from "../../../services/cilt/ciltMstrService";
import AnatomyNotification from "../../components/AnatomyNotification";

interface CiltTableProps {
  ciltList: CiltMstr[];
  loading: boolean;
  currentPage: number;
  onTableChange: (pagination: TablePaginationConfig) => void;
  onEdit: (cilt: CiltMstr) => void;
  onDetails: (cilt: CiltMstr) => void;
  onNavigateToSequences: (cilt: CiltMstr) => void;
  onClone: (cilt: CiltMstr) => void;
  onViewPositionsLevels: (cilt: CiltMstr) => void;
  onDelete?: (cilt: CiltMstr) => void;
}

const CiltTable: React.FC<CiltTableProps> = ({
  ciltList,
  loading,
  currentPage,
  onTableChange,
  onEdit,
  onDetails,
  onNavigateToSequences,
  onClone,
  onViewPositionsLevels,
  onDelete,
}) => {
  const [deleteCiltMstr, { isLoading: isDeleting }] = useDeleteCiltMstrMutation();
  
  // State for table filters
  const [tableFilters, setTableFilters] = useState<Record<string, any>>({});
  const [tableKey, setTableKey] = useState(0);

  const handleDelete = (cilt: CiltMstr) => {
    Modal.confirm({
      title: Strings.ciltMstrDeleteConfirmTitle,
      content: Strings.ciltMstrDeleteConfirmContent,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCiltMstr(cilt.id.toString()).unwrap();
          // Show success notification using localized string
          notification.success({
            message: Strings.success,
            description: Strings.ciltMstrDeleteSuccess,
          });
          // Call onDelete callback if provided
          if (onDelete) {
            onDelete(cilt);
          }
        } catch (error: any) {
          // Log and show error notification using AnatomyNotification
          AnatomyNotification.error(notification, error, Strings.ciltMstrDeleteError);
        }
      },
    });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setTableFilters({});
    
    // Force complete table re-render to reset all filters
    setTableKey(prev => prev + 1);
  };

  const columns: ColumnsType<CiltMstr> = [
    {
      title: Strings.ciltMstrListNameColumn,
      dataIndex: "ciltName",
      key: "ciltName",
      render: (text) => text || Strings.ciltMstrNA,
      sorter: (a, b) => (a.ciltName || "").localeCompare(b.ciltName || ""),
    },
    {
      title: Strings.ciltMstrListDescriptionColumn,
      dataIndex: "ciltDescription",
      key: "ciltDescription",
      ellipsis: false,
      width: 350,
      render: (text) => (
        <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {text || Strings.ciltMstrNA}
        </div>
      ),
    },
    {
      title: Strings.ciltMstrListCreatorColumn,
      dataIndex: "creatorName",
      key: "creatorName",
      render: (text) => text || Strings.ciltMstrNA,
    },
    {
      title: Strings.ciltMstrListStatusColumn,
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const { status: badgeStatus, text } = getStatusAndText(status || "");
        return <Badge status={badgeStatus} text={text} />;
      },
      filters: [
        { text: Strings.ciltMstrListActiveFilter, value: "A" },
        { text: Strings.ciltMstrListSuspendedFilter, value: "S" },
        { text: Strings.ciltMstrListCanceledFilter, value: "C" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: Strings.ciltMstrListCreationDateColumn,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : Strings.ciltMstrNA,
      sorter: (a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
    },
    {
      title: Strings.ciltMstrListActionsColumn,
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="primary" size="small" onClick={() => onEdit(record)}>
            {Strings.edit}
          </Button>
          <Button type="default" size="small" onClick={() => onDetails(record)}>
            {Strings.details}
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => onNavigateToSequences(record)}
          >
            {Strings.ciltSequences}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => onClone(record)}
          >
            {Strings.levelsTreeOptionClone}
          </Button>
                      <Button
              type="primary"
              size="small"
              onClick={() => onViewPositionsLevels(record)}
            >
              {Strings.ciltPositionsLevelsButton}
            </Button>
          <CiltPDFButton id={record.id.toString()} />
                     {onDelete && (
             <Button
               type="primary"
               size="small"
               danger
               loading={isDeleting}
               onClick={() => handleDelete(record)}
             >
               {Strings.delete}
             </Button>
           )}
        </Space>
      ),
    },
  ];

  const DEFAULT_PAGE_SIZE = 100;

  return (
    <div>
      {/* Filter controls */}
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        alignItems: "center", 
        gap: 8, 
        marginBottom: 16 
      }}>
        <Button
          type="default"
          onClick={handleClearFilters}
          disabled={Object.keys(tableFilters).length === 0}
        >
          Limpiar Filtros
        </Button>
        {Object.keys(tableFilters).length > 0 && (
          <Tag color="blue">
            Filtros activos: {Object.keys(tableFilters).length}
          </Tag>
        )}
      </div>

      {/* Table */}
      <Table
        key={tableKey}
        dataSource={ciltList}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: DEFAULT_PAGE_SIZE,
          total: ciltList.length,
          showSizeChanger: true,
          pageSizeOptions: ["20", "50", "100", "200"],
          showTotal: (total) => `Total ${total} registros`,
          onChange: (page) => {
            console.log("Changing to page:", page);
            onTableChange({ current: page, pageSize: DEFAULT_PAGE_SIZE });
          },
        }}
        onChange={(paginationConfig, filters) => {
          onTableChange(paginationConfig);
          setTableFilters(filters);
        }}
        bordered
        size="middle"
        scroll={{ x: true }}
      />
    </div>
  );
};

export default CiltTable;
