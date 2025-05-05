import { Collapse } from "antd";
import { CollapseProps } from "antd/lib";
import Strings from "../../utils/localizations/Strings";

interface AnatomySingleCollapsablePorps {
  title?: string;
  children: React.ReactNode;
}

const AnatomySingleCollapsable = ({
  title,
  children,
}: AnatomySingleCollapsablePorps) => {
  const createCollapsableItems = (): CollapseProps["items"] => [
    {
      key: "1",
      label: title ?? 'Strings.informationDetail',
      children,
    },
  ];

  return <Collapse ghost items={createCollapsableItems()} />;
};

export default AnatomySingleCollapsable;
