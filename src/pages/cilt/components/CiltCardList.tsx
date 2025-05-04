import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Spin, Typography, Badge, Button, Space } from 'antd'; 
import { useGetCiltMstrBySiteQuery } from '../../../services/cilt/ciltMstrService'; 
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr'; 
import { BsPencilSquare, BsEye, BsListTask } from 'react-icons/bs'; 
import { getStatusAndText } from '../../../utils/Extensions';
import CiltEditModal from './CiltEditModal';
import CiltDetailsModal from './CiltDetailsModal';
import CreateCiltSequenceModal from './CreateCiltSequenceModal';
import type { TablePaginationConfig } from 'antd/es/table';
import type { ColumnsType } from 'antd/es/table';
import Strings from '../../../utils/localizations/Strings';

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 10;

const CiltCardList: React.FC = () => {
  const location = useLocation();
  const siteId = location.state?.siteId || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCilt, setEditingCilt] = useState<CiltMstr | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [detailsCilt, setDetailsCilt] = useState<CiltMstr | null>(null);
  const [isCreateSequenceModalVisible, setIsCreateSequenceModalVisible] = useState(false);
  const [sequenceCilt, setSequenceCilt] = useState<CiltMstr | null>(null);

  const { data: ciltProcedures = [], isLoading, isError, error, refetch } = useGetCiltMstrBySiteQuery(siteId, {
    skip: !siteId,
    pollingInterval: 30000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [siteId]);

  const showEditModal = (cilt: CiltMstr) => {
    setEditingCilt(cilt);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingCilt(null);
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setEditingCilt(null);
    refetch();
  };
  
  const showDetailsModal = (cilt: CiltMstr) => {
    setDetailsCilt(cilt);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setDetailsCilt(null);
  };
  
  const showCreateSequenceModal = (cilt: CiltMstr) => {
    setSequenceCilt(cilt);
    setIsCreateSequenceModalVisible(true);
  };

  const handleCreateSequenceCancel = () => {
    setIsCreateSequenceModalVisible(false);
    setSequenceCilt(null);
  };

  const handleCreateSequenceSuccess = () => {
    setIsCreateSequenceModalVisible(false);
    setSequenceCilt(null);
    refetch();
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
  };

  // Define table columns
  const columns: ColumnsType<CiltMstr> = [
    {
      title: Strings.ciltMstrListNameColumn,
      dataIndex: 'ciltName',
      key: 'ciltName',
      render: (text) => text || Strings.ciltMstrNA,
      sorter: (a, b) => (a.ciltName || '').localeCompare(b.ciltName || ''),
    },
    {
      title: Strings.ciltMstrListDescriptionColumn,
      dataIndex: 'ciltDescription',
      key: 'ciltDescription',
      render: (text) => text || Strings.ciltMstrNA,
      ellipsis: true,
    },
    {
      title: Strings.ciltMstrListCreatorColumn,
      dataIndex: 'creatorName',
      key: 'creatorName',
      render: (text) => text || Strings.ciltMstrNA,
    },
    {
      title: Strings.ciltMstrListStandardTimeColumn,
      dataIndex: 'standardTime',
      key: 'standardTime',
      render: (value) => (value !== null ? `${value}` : Strings.ciltMstrNA),
      sorter: (a, b) => {
        if (a.standardTime === null && b.standardTime === null) return 0;
        if (a.standardTime === null) return -1;
        if (b.standardTime === null) return 1;
        return a.standardTime - b.standardTime;
      },
    },
    {
      title: Strings.ciltMstrListStatusColumn,
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { status: badgeStatus, text } = getStatusAndText(status || '');
        return <Badge status={badgeStatus} text={text} />;
      },
      filters: [
        { text: Strings.ciltMstrListActiveFilter, value: 'A' },
        { text: Strings.ciltMstrListSuspendedFilter, value: 'S' },
        { text: Strings.ciltMstrListCanceledFilter, value: 'C' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: Strings.ciltMstrListCreationDateColumn,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : Strings.ciltMstrNA),
      sorter: (a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      },
    },
    {
      title: Strings.ciltMstrListActionsColumn,
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<BsPencilSquare />} 
            onClick={() => showEditModal(record)}
            title={Strings.ciltMstrListEditAction}
          />
          <Button 
            type="text" 
            icon={<BsEye />} 
            onClick={() => showDetailsModal(record)}
            title={Strings.ciltMstrListDetailsAction}
          />
          <Button 
            type="text" 
            icon={<BsListTask />}
            onClick={() => showCreateSequenceModal(record)}
            title={Strings.ciltMstrCreateSequenceButton}
          />
        </Space>
      ),
    },
  ];

  if (!siteId) {
    return <Text type="secondary">{Strings.requiredSite}</Text>;
  }

  if (isLoading) {
    return <Spin tip={Strings.loading} />;
  }

  if (isError) {
    console.error('Error fetching CILT procedures:', error);
    return <Text type="danger">{Strings.errorLoadingNewTypesCilt}</Text>;
  }

  return (
    <>
      <Table
        dataSource={ciltProcedures}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: DEFAULT_PAGE_SIZE,
          total: ciltProcedures.length,
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
        bordered
        size="middle"
        scroll={{ x: true }}
      />

      {/* Edit Modal */}
      <CiltEditModal 
        visible={isEditModalVisible}
        cilt={editingCilt}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      {/* Details Modal */}
      <CiltDetailsModal
        visible={isDetailsModalVisible}
        cilt={detailsCilt}
        onCancel={handleDetailsCancel}
      />
      
      {/* Create Sequence Modal */}
      <CreateCiltSequenceModal
        visible={isCreateSequenceModalVisible}
        cilt={sequenceCilt}
        onCancel={handleCreateSequenceCancel}
        onSuccess={handleCreateSequenceSuccess}
      />
    </>
  );
};

export default CiltCardList;