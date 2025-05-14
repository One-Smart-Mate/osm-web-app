import React from "react";
import { Drawer, Typography } from "antd";
import Strings from "../../utils/localizations/Strings";
import TagList from "./TagList";

interface DrawerTagListProps {
  open: boolean;
  onClose: () => void;
  totalCards: string;
  cardTypeName: string;
  dataSource: any;
  isLoading: boolean;
  label: string;
  text: string;
  subLabel?: string;
  subText?: string;
}

const DrawerTagList: React.FC<DrawerTagListProps> = ({
  open,
  onClose,
  totalCards,
  cardTypeName,
  dataSource,
  isLoading,
  text,
  label,
  subText,
  subLabel,
}) => {
  const buildExtraLabel = () => {
    if (subText) {
      return (
        <div className="flex flex-wrap">
          <Typography.Text>
            {subLabel}
            {Strings.colon} <span className="font-normal">{subText}</span>
          </Typography.Text>
        </div>
      );
    }
    return null;
  };
  return (
    <Drawer
      closable
      destroyOnHidden
      title={
        <div className="text-sm font-medium text-black">
          <Typography.Title level={5}>{Strings.cards}</Typography.Title>
          <div className="flex flex-wrap">
            <Typography.Text>
              {label}
              {Strings.colon} <span className="font-normal">{text}</span>
            </Typography.Text>
            <Typography.Text className="flex-1 text-end font-normal">
              {totalCards}
            </Typography.Text>
          </div>
          <div className="flex flex-wrap">
            <Typography.Text>
              {Strings.type} {Strings.colon}
              <span className="font-normal">{cardTypeName}</span>
            </Typography.Text>
            <Typography.Text className="flex-1 text-end font-normal">
              {Strings.total}
            </Typography.Text>
          </div>
          {buildExtraLabel()}
        </div>
      }
      placement="right"
      open={open}
      onClose={onClose}
      loading={isLoading}
    >
      <TagList data={dataSource} isResponsive={false} isLoading={isLoading} />
    </Drawer>
  );
};

export default DrawerTagList;
