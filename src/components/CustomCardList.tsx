import React from "react";
import { List } from "antd";
import PaginatedList from "./PaginatedList";
import { CardInterface } from "../data/card/card";
import InformationPanel from "../pages/card/components/Card";
import { UserRoles } from "../utils/Extensions";

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
            <InformationPanel data={item} rol={rol} />
          </List.Item>
        )}
        loading={isLoading}
      />
    </div>
  );
};

export default CustomCardList;
