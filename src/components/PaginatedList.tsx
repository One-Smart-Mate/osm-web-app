import { List } from "antd";
import { RESPONSIVE_LIST } from "../utils/Extensions";
import Constants from "../utils/Constants";

interface ListProps {
  responsive?: boolean;
  [key: string]: any;
}

const PaginatedList = ({ responsive = true, ...rest }: ListProps) => {
  const gridConfig = responsive ? RESPONSIVE_LIST : { gutter: 16, column: 1 };

  const list = (
    <List
      grid={gridConfig}
      pagination={{
        showSizeChanger: true,
        defaultPageSize: Constants.PAGE_SIZE,
        pageSizeOptions: Constants.PAGE_SIZE_OPTIONS,
      }}
      {...rest}
    />
  );

  return list;
};

export default PaginatedList;
