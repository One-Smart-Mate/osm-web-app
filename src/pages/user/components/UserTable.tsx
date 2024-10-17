import { useEffect, useMemo, useRef, useState } from "react";
import { useTableHeight } from "../../../utils/tableHeight";
import { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { Space, Table, Tag } from "antd";
import Constants from "../../../utils/Constants";
import { Role, Site, UserTable } from "../../../data/user/user";
import UpdateUserButton from "./UpdateUserButton";

interface PrioritiesTableProps {
  data: UserTable[];
  siteId?: string;
  isLoading: boolean;
  isSiteUserstable: boolean;
}

const UserTableComponent = ({
  data,
  siteId,
  isLoading,
  isSiteUserstable,
}: PrioritiesTableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const allRowKeys = data.map((item) => item.id);
    setExpandedRowKeys(allRowKeys);
  }, [data]);

  const handleExpand = (expanded: boolean, record: UserTable) => {
    const keys = expanded
      ? [...expandedRowKeys, record.id]
      : expandedRowKeys.filter((key) => key !== record.id);
    setExpandedRowKeys(keys);
  };

  const columns: ColumnsType<UserTable> = useMemo(
    () => [
      {
        title: Strings.name,
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: Strings.email,
        dataIndex: "email",
        key: "email",
        sorter: (a, b) => a.email.localeCompare(b.email),
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
      },
      {
        title: Strings.roles,
        key: "roles",
        render: (record) => {
          return (
            <Space>
              {record.roles.map((role: Role) => (
                <Tag color="blue" key={role.id}>
                  {role.name}
                </Tag>
              ))}
            </Space>
          );
        },
      },
      ...(isSiteUserstable && siteId
        ? [
            {
              title: Strings.actions,
              render: (record: UserTable) => {
                return (
                  <Space>
                    <UpdateUserButton
                      userId={record.id}
                      siteId={siteId}
                      isSiteUserstable={isSiteUserstable}
                    />
                  </Space>
                );
              },
            },
          ]
        : [
            {
              title: Strings.sites,
              key: "sites",
              render: (record: UserTable) => {
                return (
                  <Space>
                    <p>
                      {record.sites.map((site: Site) => site.name).join(", ")}
                    </p>
                  </Space>
                );
              },
            },
          ]),
    ],
    [Strings]
  );

  const actionsRow = {
    expandedRowKeys,
    onExpand: handleExpand,
    showExpandColumn: false,
    expandedRowRender: (_: UserTable) => (
      <Space className="flex justify-end"></Space>
    ),
  };

  return (
    <div className="h-full" ref={contentRef}>
      <Table
        loading={isLoading}
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{
          defaultPageSize: Constants.PAGE_SIZE,
          showSizeChanger: true,
          pageSizeOptions: Constants.PAGE_SIZE_OPTIONS,
        }}
        key={data.length}
        scroll={{ y: tableHeight }}
        expandable={actionsRow}
      />
    </div>
  );
};

export default UserTableComponent;
