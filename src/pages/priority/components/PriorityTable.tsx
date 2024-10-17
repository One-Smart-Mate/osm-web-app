import { useMemo, useRef } from "react";
import { useTableHeight } from "../../../utils/tableHeight";
import { ColumnsType } from "antd/es/table";
import { Priority } from "../../../data/priority/priority";
import Strings from "../../../utils/localizations/Strings";
import { getStatusAndText } from "../../../utils/Extensions";
import { Badge, Space, Table } from "antd";
import Constants from "../../../utils/Constants";
import UpdatePriority from "./UpdatePriority";

interface PrioritiesTableProps {
  data: Priority[];
  isLoading: boolean;
}

const PriorityTable = ({ data, isLoading }: PrioritiesTableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef);

  const columns: ColumnsType<Priority> = useMemo(
    () => [
      {
        title: Strings.code,
        dataIndex: "priorityCode",
        key: "priorityCode",
        sorter: (a, b) => a.priorityCode.localeCompare(b.priorityCode),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: Strings.description,
        dataIndex: "priorityDescription",
        key: "priorityDescription",
        sorter: (a, b) =>
          a.priorityDescription.localeCompare(b.priorityDescription),
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
      },
      {
        title: Strings.daysNumber,
        dataIndex: "priorityDays",
        key: "priorityDays",
        sorter: (a, b) => a.priorityDays - b.priorityDays,
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
      },
      {
        title: Strings.status,
        key: "status",
        render: (record) => {
          const { status, text } = getStatusAndText(record.status);
          return <Badge status={status} text={text} />;
        },
        filters: [
          { text: "Active", value: "A" },
          { text: "Inactive", value: "I" },
        ],
        onFilter: (value, record) => record.status === value,
        ellipsis: true,
      },
      {
        title: Strings.actions,
        render: (data) => {
          return (
            <Space>
              <UpdatePriority priorityId={data.id} />
            </Space>
          );
        },
      },
    ],
    [Strings, getStatusAndText]
  );

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
      />
    </div>
  );
};

export default PriorityTable;
