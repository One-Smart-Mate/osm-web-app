import React, { useEffect, useState } from "react";
import { Descriptions, Spin, Typography } from "antd";
import { useGetlevelMutation } from "../../../services/levelService";
import Strings from "../../../utils/localizations/Strings";
import { Level } from "../../../data/level/level";

const { Title } = Typography;

interface LevelDetailsProps {
  levelId: string;
  onClose: () => void; // Function to close the panel
}

const LevelDetails: React.FC<LevelDetailsProps> = ({ levelId, onClose }) => {
  const [getLevel] = useGetlevelMutation();
  const [levelData, setLevelData] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        const response = await getLevel(levelId).unwrap();
        setLevelData(response);
      } catch (error) {
        console.error("Error fetching level data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelData();
  }, [levelId, getLevel]);

  const getStatusText = (status: string): string => {
    switch (status) {
      case "A":
        return "Active";
      case "C":
        return "Cancelled";
      case "S":
        return "Suspended";
      default:
        return Strings.none;
    }
  };

  if (isLoading) {
    return <Spin tip={"Loading"} className="flex justify-center mt-10" />;
  }

  if (!levelData) {
    return <div className="text-center">{"No data"}</div>;
  }

  return (
    <div className="mt-10 p-4 bg-white shadow-md rounded-md border border-gray-300">
      <Title level={4}>{"Level Details"}</Title>
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
          {levelData.notify ? "Yes" : "No"}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.levelMachineId}>
          {levelData.levelMachineId || Strings.none}
        </Descriptions.Item>
      </Descriptions>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          {Strings.close}
        </button>
      </div>
    </div>
  );
};

export default LevelDetails;
