import { Card, Tag, Typography } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import { CardInterface, Evidences } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";
import { useMemo } from "react";
import { AiOutlinePicture } from "react-icons/ai";
import { IoHeadsetOutline } from "react-icons/io5";
import { GoDeviceCameraVideo } from "react-icons/go";
import {
  buildCardDetailRoute,
  navigateWithState,
} from "../../../pagesRedesign/routes/RoutesExtensions";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";
import CustomTagV2 from "../../../components/CustomTagV2";
import {
  BsActivity,
  BsCalendar4,
  BsExclamationDiamond,
  BsNodePlus,
  BsPersonGear,
  BsPinMap,
} from "react-icons/bs";

interface CardProps {
  data: CardInterface;
}

const TagCardV2 = ({ data }: CardProps) => {
  const { status, text, dateStatus } = getCardStatusAndText(
    data.status,
    data.cardDueDate,
    data.cardDefinitiveSolutionDate,
    data.cardCreationDate
  );
  const navigatewithState = navigateWithState();

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

  const handleNavigation = () => {
    navigatewithState(buildCardDetailRoute(data.siteId, data.id), {
        cardId: data.id,
        cardName: `${data.cardTypeMethodologyName} ${data.siteCardId}`,
      });
  };

  return (
    <Card
      hoverable
      title={
        <div className="mt-2 flex flex-col items-center">
          <div className="flex gap-2">
            <Typography.Title level={5}>
              {data.cardTypeMethodologyName} {data.siteCardId}
            </Typography.Title>
            <div
              className="w-10 md:flex-1 rounded-full"
              style={{
                backgroundColor: `#${data.cardTypeColor}`,
                width: "1.5rem",
                height: "1.5rem",
              }}
            />
          </div>
          {evidenceIndicator(data.evidences)}
        </div>
      }
      onClick={() => {
        handleNavigation();
      }}
    >
      {dateStatus === Strings.expired ? (
        <div className="w-full flex items-center justify-end bg-gray-50 p-2 ">
          <Tag color="error">{Strings.expired}</Tag>
        </div>
      ) : (
        <>
          {Strings.dueDate}
          <span className="text-black font-medium">
            {data.cardDueDate || Strings.noDueDate}
          </span>
        </>
      )}

      <AnatomySection
        title={Strings.date}
        label={formatDate(data.cardCreationDate)}
        icon={<BsCalendar4 />}
      />
      <AnatomySection
        title={Strings.status}
        label={
          <CustomTagV2 className="w-min text-sm" color={status}>
            <span className="font-medium">{text}</span>
          </CustomTagV2>
        }
      />

      <AnatomySection
        title={Strings.cardType}
        label={data.cardTypeName}
        icon={<BsNodePlus />}
      />
      <AnatomySection
        title={Strings.problemType}
        label={`${data.preclassifierCode} ${data.preclassifierDescription}`}
        icon={<BsActivity />}
      />
      <AnatomySection
        title={Strings.anomalyDetected}
        label={data.commentsAtCardCreation || Strings.NA}
        icon={<BsExclamationDiamond />}
      />
      <AnatomySection
        title={Strings.location}
        label={data.cardLocation}
        icon={<BsPinMap />}
      />
      <AnatomySection
        title={Strings.createdBy}
        label={data.creatorName}
        icon={<BsPersonGear />}
      />
    </Card>
  );
};

export default TagCardV2;
