import { Card } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { Evidences } from "../../../data/card/card";
import { isAudioURL } from "../../../utils/Extensions";
import { useRef } from "react";

interface AudioPlayerPreviewGroupProps {
  data: Evidences[] | [];
}

const AudioPlayerPreviewGroup = ({ data }: AudioPlayerPreviewGroupProps) => {
  if (!data || data.length === 0) {
    return (
      <Card
        className="min-w-80 min-h-80 bg-gray-100 rounded-xl shadow-md"
        loading={true}
      />
    );
  }

  const audios = data
    .filter((evidence) => isAudioURL(evidence.evidenceName))
    .sort((a, b) => {
      // Sort by file name
      const nameA = a.evidenceName.toLowerCase();
      const nameB = b.evidenceName.toLowerCase();
      return nameA.localeCompare(nameB); // Ascending order
    });

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
      <div className="rounded-md p-1 mb-1 bg-white">
      <h1 className="font-semibold">{Strings.audios}</h1>
    </div>
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

export default AudioPlayerPreviewGroup;
