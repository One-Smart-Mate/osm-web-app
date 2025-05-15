import React from "react";
import { Button, Checkbox, Popover } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";

interface StatusFilterPopoverProps {
  statusFilter: boolean | null;
  setStatusFilter: (value: boolean | null) => void;
}

const StatusFilterPopover: React.FC<StatusFilterPopoverProps> = ({
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <Popover
      trigger="click"
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Checkbox
            checked={statusFilter === true}
            onChange={() =>
              setStatusFilter(statusFilter === true ? null : true)
            }
          >
            {Strings.active}
          </Checkbox>
          <Checkbox
            checked={statusFilter === false}
            onChange={() =>
              setStatusFilter(statusFilter === false ? null : false)
            }
          >
            {Strings.inactive}
          </Checkbox>
          <Button size="small" type="link" onClick={() => setStatusFilter(null)}>
            {Strings.clearFilters}
          </Button>
        </div>
      }
    >
      <Button icon={<FilterOutlined />}>{Strings.filter}</Button>
    </Popover>
  );
};

export default StatusFilterPopover;
