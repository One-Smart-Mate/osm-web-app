import React, { useEffect, useState } from "react";
import { Descriptions, Spin, Typography } from "antd";
import { useGetlevelMutation } from "../../../services/levelService";
import Strings from "../../../utils/localizations/Strings";
import { Level } from "../../../data/level/level";

const { Title } = Typography;

interface LevelDetailsProps {
  levelId: string;
  onClose: () => void;
}

const LevelDetails: React.FC<LevelDetailsProps> = ({ levelId }) => {
  const [getLevel] = useGetlevelMutation();
  const [levelData, setLevelData] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        const response = await getLevel(levelId).unwrap();
        setLevelData(response);
      } catch (error) {
        console.error(Strings.errorFetchingLevelData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelData();
  }, [levelId, getLevel]);

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
    return <Spin tip={Strings.loading} className="flex justify-center mt-10" />;
  }

  if (!levelData) {
    return <div className="text-center">{Strings.noData}</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md border border-gray-300">
      <Title level={4}>{Strings.levelDetailsTitle}</Title>
      <Descriptions bordered column={1}>
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
    </div>
  );
};

export default LevelDetails;
