import { Card } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  hasAudios,
  hasImages,
  hasVideos,
  isRedesign,
  UserRoles,
} from "../../../utils/Extensions";
import { CardInterface, Evidences } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";
import CustomTag from "../../../components/CustomTag";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { AiOutlinePicture } from "react-icons/ai";
import { IoHeadsetOutline } from "react-icons/io5";
import { GoDeviceCameraVideo } from "react-icons/go";
import {
  adminCardDetails,
  localAdminCardDetails,
  sysAdminCardDetails,
} from "../../routes/Routes";
import { buildCardDetailRoute } from "../../../pagesv2/routes/RoutesExtensions";

interface CardProps {
  data: CardInterface;
  rol: UserRoles;
}

const InformationPanel = ({ data, rol }: CardProps) => {
  const { status, text } = getCardStatusAndText(
    data.status,
    data.cardDueDate,
    data.cardDefinitiveSolutionDate,
    data.cardCreationDate
  );
  const navigate = useNavigate();

  const evidenceIndicator = (evidences: Evidences[] = []) => {
    const elements = useMemo(() => {
      const elems: JSX.Element[] = [];
      if (hasImages(evidences)) {
        elems.push(<AiOutlinePicture key="images" />);
      }
      if (hasVideos(evidences)) {
        elems.push(<GoDeviceCameraVideo key="videos" />);
      }
      if (hasAudios(evidences)) {
        elems.push(<IoHeadsetOutline key="audios" />);
      }
      return elems;
    }, [evidences]);

    return <div className="flex gap-1 text-black flex-row">{elements}</div>;
  };

  const handleCardDetailsRoute = (): string => {
      if (rol === UserRoles.IHSISADMIN) {
        return adminCardDetails.fullPath
          .replace(Strings.siteParam, data.siteId)
          .replace(Strings.cardParam, data.siteCardId);
      } else if (rol === UserRoles.LOCALSYSADMIN) {
        return sysAdminCardDetails.fullPath
          .replace(Strings.siteParam, data.siteId)
          .replace(Strings.cardParam, data.siteCardId);
      }
      return localAdminCardDetails.fullPath
        .replace(Strings.siteParam, data.siteId)
        .replace(Strings.cardParam, data.siteCardId);
  };


  const handleNavigation = () => {
    if(isRedesign()) {
      // buildCardDetailRoute(data.siteId, data.id);
       navigate(`detail/${data.siteId}/${data.id}`, {
        state: {
          cardId: data.id,
          cardName: `${data.cardTypeMethodologyName} ${data.siteCardId}`,
        },
      })
    } else {
      navigate(handleCardDetailsRoute(), {
        state: {
          cardId: data.id,
          cardName: `${data.cardTypeMethodologyName} ${data.siteCardId}`,
        },
      });
    }
  }


  return (
    <Card
      style={{ height: "auto" }}
      title={
        <div className="mt-2 flex flex-col items-center">
          <div className="flex gap-2">
            <h2 className="text-xl font-semibold text-black">
              {data.cardTypeMethodologyName} {data.siteCardId}
            </h2>
            <div
              className="w-10 md:flex-1 rounded-lg border border-black"
              style={{ backgroundColor: `#${data.cardTypeColor}` }}
            />
          </div>
          {evidenceIndicator(data.evidences)}
        </div>
      }
      className="max-w-sm h-96 mx-auto bg-gray-100 rounded-xl shadow-md"
      onClick={() => {
        handleNavigation();
      }}
      hoverable
    >
      <div className="grid gap-x-2 md:gap-x-1 gap-y-1 grid-cols-3 text-black font-medium">
        <span>{Strings.status}</span>
        <CustomTag className="col-span-2 w-min text-sm" color={status}>
          {text}
        </CustomTag>

        <span>{Strings.cardType}</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {data.cardTypeName}
          </p>
        </div>

        <span>{Strings.problemType}</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {data.preclassifierCode} {data.preclassifierDescription}
          </p>
        </div>

        <span>{Strings.location}</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {data.cardLocation}
          </p>
        </div>

        <span>{Strings.createdBy}</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {data.creatorName}
          </p>
        </div>

        <span>{Strings.date}</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {formatDate(data.cardCreationDate)}
          </p>
        </div>

        <span>{Strings.dueDate}</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {data.cardDueDate || Strings.noDueDate}
          </p>
        </div>

        <span>{Strings.commentsTag}:</span>
        <div className="col-span-2">
          <p className="max-w-48 w-fit text-white bg-card-fields rounded-lg p-1">
            {data.commentsAtCardCreation || Strings.noCommentsTag}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default InformationPanel;
