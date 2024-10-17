import { Card, Dropdown, MenuProps, Tag, theme } from "antd";
import { getStatusAndText, UserRoles } from "../../../utils/Extensions";
import { SlOptionsVertical } from "react-icons/sl";
import Strings from "../../../utils/localizations/Strings";
import { CardTypes } from "../../../data/cardtypes/cardTypes";
import ViewPreclassifiersButton from "./ViewPreclassifiersButton";
import UpdateCardType from "./UpdateCardType";
import {
  adminPreclassifiers,
  sysAdminPreclassifiers,
} from "../../routes/Routes";

interface CardProps {
  data: CardTypes;
  rol: UserRoles;
}

const CardTypesCard = ({ data, rol }: CardProps) => {
  const { status, text } = getStatusAndText(data.status);
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();

  const buildPreclassifiersRoute = () => {
    if (rol === UserRoles.IHSISADMIN)
      return adminPreclassifiers.fullPath
        .replace(Strings.siteParam, data.siteId)
        .replace(Strings.cardTypeParam, data.id);

    return sysAdminPreclassifiers.fullPath
      .replace(Strings.siteParam, data.siteId)
      .replace(Strings.cardTypeParam, data.id);
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <UpdateCardType id={data.id} />,
    },
    {
      key: "5",
      label: (
        <ViewPreclassifiersButton
          cardTypeId={data.id}
          cardTypeName={data.name}
          preclassifiersRoute={buildPreclassifiersRoute()}
        />
      ),
    },
  ];

  const titleCard = (
    <div className="flex flex-row justify-center items-center">
      <div className="ml-2 max-w-xs">
        <p className="break-words text-wrap text-sm md:text-base text-white">
          {data.name}
        </p>
      </div>
      <div className="absolute left-1">
        <Dropdown menu={{ items }} arrow>
          <SlOptionsVertical
            color={colorPrimary}
            size={20}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      </div>
    </div>
  );

  return (
    <Card
      styles={{ body: { backgroundColor: colorBgContainer } }}
      key={data.id}
      type="inner"
      title={titleCard}
      className="h-max shadow-xl overflow-hidden text-sm md:text-base relative"
    >
      <div className="absolute right-0 top-11">
        {" "}
        <Tag color={status}>{text}</Tag>
      </div>
      <div className="">
        <div className="flex flex-row">
          <h1 className="font-semibold mr-1">{Strings.methodology}: </h1>
          <p>{data.methodology}</p>
        </div>
        <div className="flex  flex-row">
          <h1 className="font-semibold mr-1">{Strings.name}: </h1>
          <p>{data.name}</p>
        </div>
        <div className="flex flex-row">
          <h1 className="font-semibold mr-1">{Strings.contact}: </h1>
          <p>{data.description}</p>
        </div>
        <div className="flex flex-row">
          <h1 className="font-semibold mr-1">{Strings.responsible}: </h1>
          <p>{data.responsableName}</p>
        </div>
        <div className="flex flex-row flex-wrap">
          <h1 className="font-semibold mr-1">{Strings.color}: </h1>
          <div
            style={{ backgroundColor: `#${data.color}`, width: 50, height: 20 }}
          />
        </div>
      </div>
    </Card>
  );
};

export default CardTypesCard;
