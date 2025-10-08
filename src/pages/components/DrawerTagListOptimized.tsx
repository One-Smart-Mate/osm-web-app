import React from "react";
import { Drawer, Typography, List } from "antd";
import Strings from "../../utils/localizations/Strings";
import TagCard from "../tags/components/TagCard";
import { CardInterface } from "../../data/card/card";

interface DrawerTagListOptimizedProps {
  open: boolean;
  onClose: () => void;
  totalCards: string;
  cardTypeName: string;
  dataSource: CardInterface[];
  isLoading: boolean;
  label: string;
  text: string;
  subLabel?: string;
  subText?: string;
}

const DrawerTagListOptimized: React.FC<DrawerTagListOptimizedProps> = ({
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
      destroyOnClose
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
      width={600}
    >
      <List
        loading={isLoading}
        dataSource={dataSource}
        renderItem={(item: CardInterface) => (
          <List.Item key={item.id}>
            <TagCard data={item} />
          </List.Item>
        )}
        // Enable virtual scrolling for better performance with large lists
        virtual
        style={{ height: 'calc(100vh - 250px)' }}
      />
    </Drawer>
  );
};

export default DrawerTagListOptimized;
