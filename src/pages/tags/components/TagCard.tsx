import { Card, Tag, theme, Typography } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import { CardInterface, Evidences } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";
import React, { useMemo } from "react";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";
import {
  BsActivity,
  BsCalendar4,
  BsCameraVideo,
  BsExclamationDiamond,
  BsImages,
  BsMusicPlayer,
  BsNodePlus,
  BsPersonGear,
  BsPinMap,
} from "react-icons/bs";
import { buildCardDetailRoute, navigateWithState } from "../../../routes/RoutesExtensions";
import TagStatus from "../../components/TagStatus";
import useDarkMode from "../../../utils/hooks/useDarkMode";

interface TagCardProps {
  data: CardInterface;
}

const TagCard = ({ data }: TagCardProps) => {
  const isDarkMode = useDarkMode();
  const { token } = theme.useToken();
  const { dateStatus } = getCardStatusAndText(
    data.status,
    data.cardDueDate,
    data.cardDefinitiveSolutionDate,
    data.cardCreationDate
  );
  const navigatewithState = navigateWithState();

  const evidenceIndicator = (evidences: Evidences[] = []) => {
    const elements = useMemo(() => {
      const elems: React.ReactElement[] = [];
      if (hasImages(evidences)) {
        elems.push(<BsImages key="images" color={token.colorText} />);
      }
      if (hasVideos(evidences)) {
        elems.push(<BsCameraVideo key="videos" color={token.colorText} />);
      }
      if (hasAudios(evidences)) {
        elems.push(<BsMusicPlayer key="audios" color={token.colorText} />);
      }
      return elems;
    }, [evidences]);

    return <div className="flex gap-1 text-black flex-row">{elements}</div>;
  };

  const handleNavigation = () => {
    navigatewithState(buildCardDetailRoute(data.siteId, data.cardUUID), {
        cardId: data.cardUUID,
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
            {data.cardTypeColor && (
              <div
                className="w-10 md:flex-1 rounded-full"
                style={{
                  backgroundColor: `#${data.cardTypeColor}`,
                  width: "1.5rem",
                  height: "1.5rem",
                }}
              />
            )}
          </div>
          {evidenceIndicator(data.evidences)}
        </div>
      }
      onClick={() => {
        handleNavigation();
      }}
    >
      {dateStatus === Strings.expired ? (
        <div className={`w-full flex items-center justify-end p-2${isDarkMode ? '' : ' bg-gray-50'}`}>
          <Tag color="error">{Strings.expired}</Tag>
        </div>
      ) : (
        <AnatomySection
          title={Strings.dueDate}
          label={data.cardDueDate || Strings.noDueDate}
          icon={<BsCalendar4 />}
        />
      )}

      <AnatomySection
        title={Strings.date}
        label={formatDate(data.cardCreationDate)}
        icon={<BsCalendar4 />}
      />
      <TagStatus card={data} justify={false} />

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

export default TagCard;
