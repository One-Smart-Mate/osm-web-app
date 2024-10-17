import { useEffect, useMemo, useRef, useState } from "react";
import { useTableHeight } from "../../../utils/tableHeight";
import { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { getStatusAndText, UserRoles } from "../../../utils/Extensions";
import { Badge, Space, Table } from "antd";
import Constants from "../../../utils/Constants";
import { CardTypes } from "../../../data/cardtypes/cardTypes";
import ViewPreclassifiersButton from "./ViewPreclassifiersButton";
import UpdateCardType from "./UpdateCardType";
import {
  adminPreclassifiers,
  sysAdminPreclassifiers,
} from "../../routes/Routes";

interface TableProps {
  data: CardTypes[];
  isLoading: boolean;
  rol: UserRoles;
}

const CardTypesTable = ({ data, isLoading, rol }: TableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const allRowKeys = data.map((item) => item.id);
    setExpandedRowKeys(allRowKeys);
  }, [data]);

  const handleExpand = (expanded: boolean, record: CardTypes) => {
    const keys = expanded
      ? [...expandedRowKeys, record.id]
      : expandedRowKeys.filter((key) => key !== record.id);
    setExpandedRowKeys(keys);
  };

  const columns: ColumnsType<CardTypes> = useMemo(
    () => [
      {
        title: Strings.methodology,
        dataIndex: "methodology",
        key: "methodology",
        sorter: (a, b) => a.methodology.localeCompare(b.methodology),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: Strings.name,
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
      },
      {
        title: Strings.description,
        dataIndex: "description",
        key: "description",
        sorter: (a, b) => a.description.localeCompare(b.description),
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
      },
      {
        title: Strings.color,
        dataIndex: "color",
        key: "color",
        render: (color: string) => (
          <div
            className="h-5 w-10 md:w-16 rounded-lg border border-black"
            style={{ backgroundColor: `#${color}` }}
          />
        ),
      },
      {
        title: Strings.responsible,
        dataIndex: "responsableName",
        key: "responsableName",
        sorter: (a, b) => a.responsableName.localeCompare(b.responsableName),
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
          { text: Strings.active, value: "A" },
          { text: Strings.inactive, value: "I" },
        ],
        onFilter: (value, record) => record.status === value,
        ellipsis: true,
      },
    ],
    []
  );

  const buildPreclassifiersRoute = (data: CardTypes) => {
    if (rol === UserRoles.IHSISADMIN)
      return adminPreclassifiers.fullPath
        .replace(Strings.siteParam, data.siteId)
        .replace(Strings.cardTypeParam, data.id);

    return sysAdminPreclassifiers.fullPath
      .replace(Strings.siteParam, data.siteId)
      .replace(Strings.cardTypeParam, data.id);
  };

  const actionsRow = {
    expandedRowKeys,
    onExpand: handleExpand,
    showExpandColumn: false,
    expandedRowRender: (data: CardTypes) => (
      <Space className="flex justify-end">
        <ViewPreclassifiersButton
          cardTypeId={data.id}
          cardTypeName={data.name}
          preclassifiersRoute={buildPreclassifiersRoute(data)}
        />
        <UpdateCardType id={data.id} />
      </Space>
    ),
  };

  return (
    <div className="h-full" ref={contentRef}>
      <Table
        loading={isLoading}
        size="middle"
        columns={columns}
        rowKey="id"
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

export default CardTypesTable;
