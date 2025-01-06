import { Card } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  hasAudios,
  hasImages,
  hasVideos,
  UserRoles,
} from "../../../utils/Extensions";
import { CardInterface, Evidences } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";
import CustomTagV2 from "../../../components/CustomTagV2";
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

interface CardProps {
  data: CardInterface;
  rol: UserRoles;
}

const Tag = ({ data, rol }: CardProps) => {
  const { status, text, dateStatus } = getCardStatusAndText(data.status, data.cardDueDate, data.cardDefinitiveSolutionDate, data.cardCreationDate);
  const navigate = useNavigate();

  const evidenceIndicator = (evidences: Evidences[]) => {
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

  const buildCardDetailsRoute = () => {
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

  return (
    <Card
    title={
      <div className="mt-2 flex flex-col items-center">
        <div className="flex gap-2">
          <h3 className="text-xl font-semibold text-black truncate">
            {data.cardTypeMethodologyName} {data.siteCardId}
          </h3>
        </div>
  
        {evidenceIndicator(data.evidences)}
      </div>
    }
    className="max-w-sm min-h-[300px] mx-auto bg-gray-100 rounded-xl shadow-md"
    onClick={() => {
      navigate(buildCardDetailsRoute(), {
        state: {
          cardId: data.id,
          cardName: `${data.cardTypeMethodologyName} ${data.siteCardId}`,
        },
      });
    }}
    hoverable
  >
    <div className="mb-2">
      <p className="text-[13px] text-center">
        {formatDate(data.cardCreationDate)}
      </p>
    </div>
  
    <div className="flex items-center gap-4">
      {/* Status */}
      <div className="flex items-center gap-1">
        <span>{Strings.status}</span>
        <CustomTagV2 className="w-min text-sm" color={status}>
          <span className="font-medium">{text}</span>
        </CustomTagV2>
      </div>
  
      <div className="flex items-center gap-1 w-full">
        {dateStatus === "Expired" ? (
          <div className="bg-red-500 text-white text-center font-bold px-2 py-1 rounded-md w-full">
            Expired
          </div>
        ) : (
          <>
            {Strings.dueDate}
            <span className="text-black font-medium">
              {data.cardDueDate || Strings.noDueDate}
            </span>
          </>
        )}
      </div>
    </div>
  
    <div>
      <div className="w-full flex items-center gap-12">
        <span>{Strings.cardType}</span>
        <p
          className="font-medium p-2 text-center text-xl"
          style={{ color: `#${data.cardTypeColor}` }}
        >
          {data.cardTypeName}
        </p>
      </div>
    </div>
  
    <div>
      <span>{Strings.problemType}</span>
      <div className="font-bold mb-2">
        {data.preclassifierCode} {data.preclassifierDescription}
      </div>
  
      <span>{Strings.problemDescription}</span>
      <div className="font-bold mb-2">
        {data.commentsAtCardCreation || Strings.NA}
      </div>
  
      <span>{Strings.location}</span>
      <div className="font-bold mb-2">{data.cardLocation}</div>
    </div>
  
    <div>
      <div className="w-full flex items-center gap-12">
        <span>{Strings.createdBy}</span>
        <p className="font-bold p-2 text-center">{data.creatorName}</p>
      </div>
    </div>
  </Card>
  
  );
  
};

export default Tag;
