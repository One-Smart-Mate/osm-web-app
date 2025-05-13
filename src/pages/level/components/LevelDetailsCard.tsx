import React, { useEffect, useState } from "react";
import { Descriptions, App as AntApp, Typography } from "antd";
import { useGetlevelMutation } from "../../../services/levelService";
import { useGetCardsByLevelMutation } from "../../../services/cardService";
import Strings from "../../../utils/localizations/Strings";
import { Level } from "../../../data/level/level";
import MainContainer from "../../layouts/MainContainer";
import AnatomyNotification from "../../components/AnatomyNotification";
import TagList from "../../components/TagList";

const { Title } = Typography;

interface LevelDetailsCardProps {
  levelId: string;
  siteId: string;
  onClose: () => void;
}

const LevelDetailsCard = ({
  levelId,
  siteId,
}: LevelDetailsCardProps): React.ReactElement => {
  const [getLevel] = useGetlevelMutation();
  const [data, setData] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {notification} = AntApp.useApp();

  const [
    getCardsByLevel,
    { data: cardsData, isLoading: isCardsLoading, error: cardsError },
  ] = useGetCardsByLevelMutation();

  useEffect(() => {
    handleGetLevelData();
    getCardsByLevel({ levelId, siteId });
  }, [levelId, siteId, getLevel, getCardsByLevel]);

  const handleGetLevelData = async () => {
    try {
      const response = await getLevel(levelId).unwrap();
      setData(response);
    } catch (error) {
      AnatomyNotification.error(notification, Strings.errorFetchingLevelData);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case Strings.detailsOptionA:
        return Strings.detailsStatusActive;
      case Strings.detailsOptionC:
        return Strings.detailsStatusCancelled;
      case Strings.detailsOptionS:
        return Strings.detailsStatusSuspended;
      default:
        return Strings.none;
    }
  };

  return (
    <MainContainer
      title={Strings.empty}
      isLoading={isLoading}
      content={
        <div className="p-3 bg-white shadow-md rounded-md border border-gray-300">
          <Title level={4}>{Strings.levelDetailsTitle}</Title>
          {data && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={Strings.name}>
                {data.name}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.description}>
                {data.description}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.responsible}>
                {data.responsibleName || Strings.none}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.status}>
                {getStatusText(data.status)}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.notify}>
                {data.notify ? Strings.yes : Strings.no}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.levelMachineId}>
                {data.levelMachineId || Strings.none}
              </Descriptions.Item>
            </Descriptions>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <Title level={4} className="mb-0">
                {Strings.associatedTags}
              </Title>
              <span className="text-sm font-bold mb-3">
                {Strings.total}: {cardsData?.length ?? 0}
              </span>
            </div>
            <TagList
              data={cardsData || []}
              isLoading={isCardsLoading}
              isResponsive={false}
            />
          </div>

          {cardsError && (
            <div className="mt-2 text-red-500">
              {Strings.error}: {JSON.stringify(cardsError)}
            </div>
          )}
        </div>
      }
    />
  );
};

export default LevelDetailsCard;
