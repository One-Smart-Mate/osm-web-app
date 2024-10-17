import { useEffect, useMemo, useRef, useState } from "react";
import { useTableHeight } from "../../../utils/tableHeight";
import { ColumnsType } from "antd/es/table";
import Strings from "../../../utils/localizations/Strings";
import { Badge, Space, Table } from "antd";
import { getStatusAndText, UserRoles } from "../../../utils/Extensions";
import Constants from "../../../utils/Constants";
import { Site } from "../../../data/site/site";
import ViewPrioritiesButton from "./ViewPrioritiesButton";
import ViewCardTypesButton from "./ViewCardTypesButton";
import UpdateSite from "./UpdateSite";
import ViewLevelsButton from "./ViewLevelsButton";
import ViewCardsButton from "./ViewCardsButton";
import ViewChartsButton from "./ViewChartsButton";
import ViewUsersButton from "./ViewUsersButton";

interface TableProps {
  data: Site[];
  isLoading: boolean;
  rol: UserRoles;
}

const SiteTable = ({ data, isLoading, rol }: TableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const allRowKeys = data.map((item) => item.id);
    setExpandedRowKeys(allRowKeys);
  }, [data]);

  const handleExpand = (expanded: boolean, record: Site) => {
    const keys = expanded
      ? [...expandedRowKeys, record.id]
      : expandedRowKeys.filter((key) => key !== record.id);
    setExpandedRowKeys(keys);
  };

  const uniqueExtensions = [...new Set(data.map((item) => item.extension))];

  const extensionFilters = uniqueExtensions.map((extension) => ({
    text: extension === null ? Strings.noExtension : extension,
    value: extension,
  }));

  const columns: ColumnsType<Site> = useMemo(
    () => [
      {
        title: Strings.logo,
        dataIndex: "logo",
        key: "logo",
        render: (text) => (
          <img
            className="size-20 lg:size-16 md:size-12"
            src={text}
            alt="logo"
          />
        ),
      },
      {
        title: Strings.companyName,
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: Strings.rfc,
        dataIndex: "rfc",
        key: "rfc",
        sorter: (a, b) => a.rfc.localeCompare(b.rfc),
      },
      {
        title: Strings.companyAddress,
        dataIndex: "address",
        key: "address",
        sorter: (a, b) => a.address.localeCompare(b.address),
      },
      {
        title: Strings.contact,
        dataIndex: "contact",
        key: "contact",
        sorter: (a, b) => a.contact.localeCompare(b.contact),
      },
      {
        title: Strings.position,
        dataIndex: "position",
        key: "position",
        sorter: (a, b) => a.position.localeCompare(b.position),
      },
      {
        title: Strings.phone,
        dataIndex: "phone",
        key: "phone",
        sorter: (a, b) => a.phone.localeCompare(b.phone),
      },
      {
        title: Strings.extension,
        dataIndex: "extension",
        key: "extension",
        filters: extensionFilters,
        onFilter: (value, record) => record.extension === value,
        ellipsis: true,
      },
      {
        title: Strings.email,
        dataIndex: "email",
        key: "email",
        sorter: (a, b) => a.email.localeCompare(b.email),
      },
      {
        title: Strings.cellular,
        dataIndex: "cellular",
        key: "cellular",
        sorter: (a, b) => a.cellular.localeCompare(b.cellular),
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
        filterMultiple: false,
        ellipsis: true,
      },
    ],
    [Strings, extensionFilters, getStatusAndText]
  );

  const buildSiteActions = (data: Site) => {
    const actions = [];
    if (rol === UserRoles.IHSISADMIN || rol === UserRoles.LOCALSYSADMIN) {
      actions.push(
        <UpdateSite key={`update-site-${data.id}`} siteId={data.id} />
      );
    }
    if (rol === UserRoles.IHSISADMIN) {
      actions.push(
        <ViewChartsButton
          key={`view-charts-${data.id}`}
          siteId={data.id}
          siteName={data.name}
        />
      );
      actions.push(
        <ViewCardsButton
          key={`view-cards-${data.id}`}
          siteId={data.id}
          siteName={data.name}
        />
      );
      actions.push(
        <ViewUsersButton
          key={`view-users-${data.id}`}
          siteId={data.id}
          siteName={data.name}
        />
      );
      actions.push(
        <ViewPrioritiesButton
          key={`view-priorities-${data.id}`}
          siteId={data.id}
          siteName={data.name}
        />
      );
      actions.push(
        <ViewLevelsButton
          key={`view-levels-${data.id}`}
          siteId={data.id}
          siteName={data.name}
        />
      );
      actions.push(
        <ViewCardTypesButton
          key={`view-card-types-${data.id}`}
          siteId={data.id}
          siteName={data.name}
        />
      );
    }

    return actions;
  };

  const actionsRow = {
    expandedRowKeys,
    onExpand: handleExpand,
    showExpandColumn: false,
    expandedRowRender: (data: Site) => (
      <Space className="flex justify-end">{buildSiteActions(data)}</Space>
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

export default SiteTable;
