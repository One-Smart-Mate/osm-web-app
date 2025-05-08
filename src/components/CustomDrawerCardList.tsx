import React from "react";
import { Drawer, List } from "antd";
import PaginatedList from "./PaginatedList"; // Asegúrate de importar los componentes que usesmporta las constantes si las necesitas
import { CardInterface } from "../data/card/card";
import { UserRoles } from "../utils/Extensions";
import InformationPanel from "../pages/card/components/Card";
import Strings from "../utils/localizations/Strings";

interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  totalCards: string;
  cardTypeName: string;
  dataSource: any;
  isLoading: boolean;
  rol: UserRoles;
  label: string;
  text: string;
  label2?: string;
  text2?: string;
}

const CustomDrawerCardList: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  totalCards,
  cardTypeName,
  dataSource,
  isLoading,
  rol,
  text,
  label,
  text2,
  label2,
}) => {
  const buildExtraLabel = () => {
    if (text2) {
      return (
        <div className="flex flex-wrap">
          <h1>
            {label2}
            {Strings.colon} <span className="font-normal">{text2}</span>
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
              {Strings.colon}{" "}
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
      <PaginatedList
        responsive={false}
        dataSource={dataSource}
        renderItem={(item: CardInterface, index: number) => (
          <List.Item>
            <InformationPanel key={index} data={item} rol={rol} />
          </List.Item>
        )}
        loading={isLoading}
      />
    </Drawer>
  );
};

export default CustomDrawerCardList;
