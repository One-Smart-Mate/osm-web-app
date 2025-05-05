import { useMemo, useRef } from "react";
import { useTableHeight } from "../../../utils/tableHeight";
import { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { getStatusAndText } from "../../../utils/Extensions";
import { Badge, Space, Table } from "antd";
import Constants from "../../../utils/Constants";
import UpdatePreclassierButton from "./UpdatePreclassifierButton";
import Preclassifier from "../../../data/preclassifier/preclassifier";

interface TableProps {
  data: Preclassifier[];
  isLoading: boolean;
}

const PreclassifierTable = ({ data, isLoading }: TableProps) => {
  const contentRef = useRef<HTMLDivElement>(new HTMLDivElement());
  const tableHeight = useTableHeight(contentRef);

  const columns: ColumnsType<Preclassifier> = useMemo(
    () => [
      {
        title: Strings.code,
        dataIndex: "preclassifierCode",
        key: "preclassifierCode",
        sorter: (a, b) =>
          a.preclassifierCode.localeCompare(b.preclassifierCode),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: Strings.description,
        dataIndex: "preclassifierDescription",
        key: "preclassifierDescription",
        sorter: (a, b) =>
          a.preclassifierDescription.localeCompare(b.preclassifierDescription),
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
      },
      {
        title: Strings.status,
        key: Strings.status,
        render: (record: Preclassifier) => {
          const { status, text } = getStatusAndText(record.status);
          return <Badge status={status} text={text} />;
        },
        filters: [
          { text: Strings.active, value: "A" },
          { text: Strings.inactive, value: "I" },
        ],
        onFilter: (value, record) => record.status === value,
        ellipsis: true,
      },
      {
        title: Strings.actions,
        render: (data) => {
          return (
            <Space className="flex justify-end">
              <UpdatePreclassierButton preclassifierId={data.id} />
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

export default PreclassifierTable;
