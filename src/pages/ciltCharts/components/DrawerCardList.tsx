import React from "react";
import { Drawer, Typography } from "antd";
import Strings from "../../../utils/localizations/Strings";
import TagList from "../../components/TagList";
import { CardInterface } from "../../../data/card/card";

interface DrawerCardListProps {
  open: boolean;
  onClose: () => void;
  cards: CardInterface[];
  isLoading: boolean;
  title: string;
  date: string;
  chartType: string;
}

const DrawerCardList: React.FC<DrawerCardListProps> = ({
  open,
  onClose,
  cards,
  isLoading,
  title,
  date,
  chartType,
}) => {
  return (
    <Drawer
      closable
      destroyOnHidden
      title={
        <div className="text-sm font-medium text-black">
          <Typography.Title level={5}>{title}</Typography.Title>
          <div className="flex flex-wrap">
            <Typography.Text>
              {Strings.date}
              {Strings.colon} <span className="font-normal">{date}</span>
            </Typography.Text>
          </div>
          <div className="flex flex-wrap">
            <Typography.Text>
              {Strings.type} {Strings.colon}
              <span className="font-normal">{chartType}</span>
            </Typography.Text>
          </div>
        </div>
      }
      placement="right"
      open={open}
      onClose={onClose}
      loading={isLoading}
    >
      <TagList data={cards} isResponsive={false} isLoading={isLoading} />
    </Drawer>
  );
};

export default DrawerCardList;
