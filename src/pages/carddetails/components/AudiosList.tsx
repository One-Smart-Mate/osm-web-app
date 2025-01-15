import { Card, List } from "antd";
import Strings from "../../../utils/localizations/Strings";
import sectionsTitlesCardDetails from "../../../components/SectionsTitlesCardDetails";
import { Evidences } from "../../../data/card/card";
import { isAudioURL } from "../../../utils/Extensions";
import { useEffect, useRef } from "react";

interface CardProps {
  data: Evidences[] | [];
}

const AudiosList = ({ data }: CardProps) => {
  if (!data) {
    return (
      <Card
        className="min-w-80 min-h-80 bg-gray-100 rounded-xl shadow-md"
        loading={true}
      />
    );
  }
  const audios = data.filter((evidence) => isAudioURL(evidence.evidenceName));

  const audioRefs = useRef<HTMLAudioElement[]>([]);

  const handlePlay = (currentIndex: number) => {
    audioRefs.current.forEach((audio, index) => {
      if (index !== currentIndex && !audio.paused) {
        audio.pause();
      }
    });
  };

  useEffect(() => {
    return () => {
      audioRefs.current = [];
    };
  }, []);

  return (
    <div className="md:w-72 rounded-lg p-1 bg-card-fields">
      {sectionsTitlesCardDetails(Strings.audios)}
      <List
        className="px-2 md:h-60 overflow-auto"
        dataSource={audios}
        size="small"
        renderItem={(audio, index) => (
          <List.Item>
            <audio
              ref={(audioItem) => {
                if (audioItem) audioRefs.current[index] = audioItem;
              }}
              onPlay={() => handlePlay(index)}
              controls
              src={audio.evidenceName}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default AudiosList;
