import { useEffect, useMemo, useRef, useState } from "react";
import { useTableHeight } from "../../../utils/tableHeight";
import { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { Space, Table, Tag, Tooltip } from "antd";
import Constants from "../../../utils/Constants";
import { Role, Site, UserPosition, UserTable } from "../../../data/user/user";
import UpdateUserButton from "./UpdateUserButton";
import { useGetUserPositionsMutation } from "../../../services/userService";

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
  const [userPositions, setUserPositions] = useState<Record<string, UserPosition[]>>({});
  const [getUserPositions] = useGetUserPositionsMutation();
  const [loadingPositions, setLoadingPositions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const allRowKeys = data.map((item) => item.id);
    setExpandedRowKeys(allRowKeys);
  }, [data]);

  useEffect(() => {
    const fetchPositions = async () => {
      for (const user of data) {
        try {
          setLoadingPositions(prev => ({ ...prev, [user.id]: true }));
          const positions = await getUserPositions(user.id).unwrap();
          setUserPositions(prev => ({ ...prev, [user.id]: positions }));
        } catch (error) {
          console.error(`Error fetching positions for user ${user.id}:`, error);
          setUserPositions(prev => ({ ...prev, [user.id]: [] }));
        } finally {
          setLoadingPositions(prev => ({ ...prev, [user.id]: false }));
        }
      }
    };

    fetchPositions();
  }, [data, getUserPositions]);

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
            <Space wrap>
              {record.roles.map((role: Role) => (
                <Tooltip key={role.id} title={role.name}>
                  <Tag color="blue">
                    {role.name}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          );
        },
      },
      {
        title: Strings.userPositions,
        key: "positions",
        render: (record: UserTable) => {
          const positions = userPositions[record.id] || [];
          const isLoading = loadingPositions[record.id];
          
          if (isLoading) {
            return <span>{Strings.loadingUserPositions}...</span>;
          }
          
          return (
            <Space wrap>
              {positions.length > 0 ? (
                positions.map((position) => (
                  <Tooltip key={position.id} title={position.description}>
                    <Tag color="default" style={{ backgroundColor: '#f0f0f0', color: '#595959' }}>
                      {position.name}
                    </Tag>
                  </Tooltip>
                ))
              ) : (
                <span>{Strings.noPositionsAvailable}</span>
              )}
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
    [Strings, userPositions, loadingPositions]
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
