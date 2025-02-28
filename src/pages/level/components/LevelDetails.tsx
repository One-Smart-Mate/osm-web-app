import React, { useEffect, useState } from "react";
import { Descriptions, Spin, Typography } from "antd";
import { useGetlevelMutation } from "../../../services/levelService";
import { useGetCardsByLevelMutation } from "../../../services/cardService";
import Strings from "../../../utils/localizations/Strings";
import { Level } from "../../../data/level/level";
import CustomCardList from "../../../components/CustomCardList";
import { UserRoles } from "../../../utils/Extensions";
import { notification } from "antd";

const { Title } = Typography;

interface LevelDetailsProps {
  levelId: string;
  siteId: string;
  onClose: () => void;
}

const LevelDetails: React.FC<LevelDetailsProps> = ({ levelId, siteId }) => {
  const [getLevel] = useGetlevelMutation();
  const [levelData, setLevelData] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [
    getCardsByLevel,
    { data: cardsData, isLoading: isCardsLoading, error: cardsError },
  ] = useGetCardsByLevelMutation();

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        const response = await getLevel(levelId).unwrap();
        setLevelData(response);
      } catch (error) {
        console.error(Strings.errorFetchingLevelData, error);
        notification.error({
          message: "Upload Error",
          description: "There was an issue fetching the level data. Please check your internet connection or try again later",
          placement: "topRight",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelData();
    getCardsByLevel({ levelId, siteId });
  }, [levelId, siteId, getLevel, getCardsByLevel]);

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

  if (isLoading) {
    return <Spin className="flex justify-center" />;
  }

  if (!levelData) {
    return <div className="text-center">{Strings.noData}</div>;
  }

  return (
    <div className="p-3 bg-white shadow-md rounded-md border border-gray-300">
      <Title level={4}>{Strings.levelDetailsTitle}</Title>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label={Strings.name}>
          {levelData.name}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.description}>
          {levelData.description}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.responsible}>
          {levelData.responsibleName || Strings.none}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.status}>
          {getStatusText(levelData.status)}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.notify}>
          {levelData.notify ? Strings.yes : Strings.no}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.levelMachineId}>
          {levelData.levelMachineId || Strings.none}
        </Descriptions.Item>
      </Descriptions>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Title level={4} className="mb-0">
            {Strings.associatedTags}
          </Title>
          <span className="text-sm font-bold mb-3">
            {Strings.total}: {cardsData?.length ?? 0}
          </span>
        </div>
        <CustomCardList
          dataSource={cardsData || []}
          isLoading={isCardsLoading}
          rol={UserRoles.LOCALSYSADMIN}
        />
      </div>

      {cardsError && (
        <div className="mt-2 text-red-500">
          Error cargando cards: {JSON.stringify(cardsError)}
        </div>
      )}
    </div>
  );
};

export default LevelDetails;
