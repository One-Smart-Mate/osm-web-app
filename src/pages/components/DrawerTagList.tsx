import React from "react";
import { Drawer } from "antd";
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
          <h1>
            {subLabel}
            {Strings.colon} <span className="font-normal">{subText}</span>
          </h1>
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
          <h1 className="text-lg font-semibold">{Strings.cards}</h1>
          <div className="flex flex-wrap">
            <h1>
              {label}
              {Strings.colon} <span className="font-normal">{text}</span>
            </h1>
            <h1 className="flex-1 text-end font-normal">{totalCards}</h1>
          </div>
          <div className="flex flex-wrap">
            <h1 className="flex-1">
              {Strings.type}
              {Strings.colon}
              <span className="font-normal">{cardTypeName}</span>
            </h1>
            <h1 className="flex-1 text-end">{Strings.total}</h1>
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
