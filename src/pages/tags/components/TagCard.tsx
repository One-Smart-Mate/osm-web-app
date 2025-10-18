import { Card, Tag, theme, Typography, Dropdown, Button } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import { CardInterface, Evidences } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";
import React, { useMemo, useState } from "react";
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
  BsThreeDotsVertical,
} from "react-icons/bs";
import { buildCardDetailRoute, navigateWithState } from "../../../routes/RoutesExtensions";
import TagStatus from "../../components/TagStatus";
import useDarkMode from "../../../utils/hooks/useDarkMode";
import CardSolutionModal from "./CardSolutionModal";
import Constants from "../../../utils/Constants";

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
  const [solutionModalVisible, setSolutionModalVisible] = useState(false);
  const [solutionType, setSolutionType] = useState<'provisional' | 'definitive' | null>(null);

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

  const handleProvisionalSolution = () => {
    setSolutionType('provisional');
    setSolutionModalVisible(true);
  };

  const handleDefinitiveSolution = () => {
    setSolutionType('definitive');
    setSolutionModalVisible(true);
  };

  const canApplySolution = () => {
    // Enable solution options for cards that are not discarded, resolved, or closed
    const isCardDiscarded = data.status === Constants.STATUS_DRAFT; // 'D'
    const isCardClosed = data.status === Constants.STATUS_RESOLVED || data.status === Constants.STATUS_CANCELED;

    return !isCardDiscarded && !isCardClosed;
  };

  const dropdownItems = [
    {
      key: 'provisional',
      label: Strings.provisionalSolution || 'Solución Provisional',
      disabled: !canApplySolution(),
    },
    {
      key: 'definitive',
      label: Strings.definitiveSolution || 'Solución Definitiva',
      disabled: !canApplySolution(),
    },
  ];

  const handleMenuClick = (info: any) => {
    // Prevent propagation to parent card
    if (info.domEvent) {
      info.domEvent.stopPropagation();
      info.domEvent.preventDefault();
    }

    switch (info.key) {
      case 'provisional':
        handleProvisionalSolution();
        break;
      case 'definitive':
        handleDefinitiveSolution();
        break;
    }
  };

  return (
    <>
    <Card
      hoverable
      title={
        <div className="mt-2 flex flex-col items-center relative">
          <div className="flex gap-2 w-full justify-center relative">
            <Typography.Title level={5}>
              {data.cardTypeMethodologyName} {data.siteCardId}
            </Typography.Title>
            {data.cardTypeColor && (
              <div
                className="rounded-full"
                style={{
                  backgroundColor: `#${data.cardTypeColor}`,
                  width: "1.5rem",
                  height: "1.5rem",
                }}
              />
            )}
            {/* Three dots menu positioned in top right */}
            <div
              className="absolute top-0 right-0"
              style={{ zIndex: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown
                menu={{
                  items: dropdownItems,
                  onClick: handleMenuClick
                }}
                trigger={['click']}
                placement="bottomRight"
                overlayStyle={{ zIndex: 1050 }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<BsThreeDotsVertical />}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                />
              </Dropdown>
            </div>
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
        title={Strings.responsible}
        label={data.mechanicName || Strings.NA}
        icon={<BsPersonGear />}
      />
      <AnatomySection
        title={Strings.createdBy}
        label={data.creatorName}
        icon={<BsPersonGear />}
      />
    </Card>

    {/* Solution Modal */}
    {solutionModalVisible && solutionType && (
      <CardSolutionModal
        visible={solutionModalVisible}
        onClose={() => {
          setSolutionModalVisible(false);
          setSolutionType(null);
        }}
        card={data}
        solutionType={solutionType}
        onSuccess={() => {
          // Optionally refresh card data or parent component
        }}
      />
    )}
  </>
  );
};

export default TagCard;
