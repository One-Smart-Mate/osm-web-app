import { Card } from "antd";
import Strings from "../../../utils/localizations/Strings";
import sectionsTitlesCardDetails from "../../../components/SectionsTitlesCardDetails";
import { Evidences } from "../../../data/card/card";
import { isAudioURL } from "../../../utils/Extensions";
import { useRef } from "react";

interface CardProps {
  data: Evidences[] | [];
}

const AudioPlayer = ({ data }: CardProps) => {
  if (!data || data.length === 0) {
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

  return (
    <div>
      <div>{sectionsTitlesCardDetails(Strings.audios)}</div>
      <div className="flex flex-wrap gap-4 px-2">
        {audios.map((audio, index) => (
          <audio
            key={index}
            ref={(audioItem) => {
              if (audioItem) audioRefs.current[index] = audioItem;
            }}
            onPlay={() => handlePlay(index)}
            controls
            src={audio.evidenceName}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioPlayer;
