import { Card } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { Evidences } from "../../../data/card/card";
import {
  isAudioEvidence,
  useAuthenticatedMedia,
} from "../../../utils/evidenceMedia";

interface AudioPlayerPreviewGroupProps {
  data: Evidences[] | [];
}

/**
 * Single evidence audio, fetched authenticated and played from a blob URL.
 */
const AuthenticatedAudio = ({
  evidence,
  onPlay,
  registerRef,
}: {
  evidence: Evidences;
  onPlay: () => void;
  registerRef: (_el: HTMLAudioElement | null) => void;
}) => {
  const { url } = useAuthenticatedMedia(evidence.evidenceName);
  if (!url) return null;
  return <audio ref={registerRef} onPlay={onPlay} controls src={url} />;
};

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
    .filter(isAudioEvidence)
    .sort((a, b) =>
      a.evidenceName.toLowerCase().localeCompare(b.evidenceName.toLowerCase())
    );

  const audioRefs: HTMLAudioElement[] = [];

  const handlePlay = (currentIndex: number) => {
    audioRefs.forEach((audio, index) => {
      if (index !== currentIndex && audio && !audio.paused) {
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
          <AuthenticatedAudio
            key={audio.id || `fallback-id-${index}`}
            evidence={audio}
            onPlay={() => handlePlay(index)}
            registerRef={(el) => {
              if (el) audioRefs[index] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioPlayerPreviewGroup;
