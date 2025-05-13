import React from "react";
import { List } from "antd";
import PaginatedList from "./PaginatedList";
import { CardInterface } from "../data/card/card";
import TagCard from "../pages/tags/components/TagCard";

interface TagListProps {
  data: CardInterface[];
  isResponsive?: boolean;
  isLoading?: boolean;
}
const TagList = ({data, isLoading, isResponsive = true}: TagListProps): React.ReactElement => {
  return (
    <PaginatedList
        dataSource={data}
        responsive={isResponsive}
        renderItem={(item: CardInterface, index: number) => (
          <List.Item key={index}>
            <TagCard data={item}/>
          </List.Item>
        )}
        loading={isLoading}
      />
  );
};

export default TagList;
