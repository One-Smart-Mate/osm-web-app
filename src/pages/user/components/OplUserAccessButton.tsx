import { useState } from "react";
import { Button, Modal, Table, Empty, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { useGetUserOplAccessQuery } from "../../../services/cilt/oplMstrService";
import { OplUserAccess } from "../../../data/cilt/oplMstr/oplMstr";
import { formatDate } from "../../../utils/Extensions";

interface OplUserAccessButtonProps {
  userId: string;
  userName?: string;
}

/**
 * Shows, in a modal, every OPL a user has accessed with its node path,
 * last-access date and access count. Mirrors the "Assign Positions" button.
 */
const OplUserAccessButton = ({
  userId,
  userName,
}: OplUserAccessButtonProps) => {
  const [open, setOpen] = useState(false);

  const { data, isFetching } = useGetUserOplAccessQuery(userId, {
    skip: !open || !userId,
  });

  const columns: ColumnsType<OplUserAccess> = [
    {
      title: Strings.oplUserAccessOplColumn,
      dataIndex: "title",
      key: "title",
      render: (title) => title || Strings.NA,
    },
    {
      title: Strings.oplUserAccessPathColumn,
      dataIndex: "path",
      key: "path",
      render: (path) => path || Strings.NA,
    },
    {
      title: Strings.oplUserAccessLastColumn,
      dataIndex: "lastAccessAt",
      key: "lastAccessAt",
      sorter: (a, b) =>
        new Date(a.lastAccessAt || 0).getTime() -
        new Date(b.lastAccessAt || 0).getTime(),
      defaultSortOrder: "descend",
      render: (date) => (date ? formatDate(date) : Strings.NA),
    },
    {
      title: Strings.oplUserAccessCountColumn,
      dataIndex: "accessCount",
      key: "accessCount",
      align: "center",
      width: 90,
      render: (count) => <Tag color="blue">{count ?? 0}</Tag>,
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {Strings.oplUserAccessButton}
      </Button>

      <Modal
        title={`${Strings.oplUserAccessTitle} ${userName ?? ""}`.trim()}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={760}
      >
        <Table
          rowKey="oplId"
          size="small"
          loading={isFetching}
          dataSource={data ?? []}
          columns={columns}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={Strings.oplUserAccessEmpty}
              />
            ),
          }}
        />
      </Modal>
    </>
  );
};

export default OplUserAccessButton;
