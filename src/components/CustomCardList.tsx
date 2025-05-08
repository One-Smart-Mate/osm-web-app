import React from "react";
import { List } from "antd";
import PaginatedList from "./PaginatedList";
import { CardInterface } from "../data/card/card";
import { UserRoles } from "../utils/Extensions";
import TagCardV2 from "../pages/card/components/TagCardV2";

interface CustomCardListProps {
  dataSource: CardInterface[];
  isLoading: boolean;
  rol: UserRoles;
}
const CustomCardList: React.FC<CustomCardListProps> = ({
  dataSource,
  isLoading,
  rol,
}) => {
  return (
    <div>
      <PaginatedList
        responsive={false}
        dataSource={dataSource}
        renderItem={(item: CardInterface, index: number) => (
          <List.Item key={index}>
            <TagCardV2 data={item} key={index} />
          </List.Item>
        )}
        loading={isLoading}
      />
    </div>
  );
};

export default CustomCardList;
