import React from "react";
import { List } from "antd";
import PaginatedList from "../../components/PaginatedList";
import TagCard from "../tags/components/TagCard";
import { CardInterface } from "../../data/card/card";


interface TagListProps {
  data: CardInterface[];
  isResponsive?: boolean;
  isLoading?: boolean;
}
const TagList = ({
  data,
  isLoading,
  isResponsive = true,
}: TagListProps): React.ReactElement => {
  return (
    <PaginatedList
      className="no-scrollbar"
      dataSource={data}
      responsive={isResponsive}
      renderItem={(item: CardInterface, index: number) => (
        <List.Item key={index}>
          <TagCard data={item} />
        </List.Item>
      )}
      loading={isLoading}
    />
  );
};

export default TagList;
