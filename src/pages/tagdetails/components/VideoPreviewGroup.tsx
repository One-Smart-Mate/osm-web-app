import { useState } from "react";
import { Modal } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";
import { Evidences } from "../../../data/card/card";
import {
  isVideoEvidence,
  useAuthenticatedMedia,
} from "../../../utils/evidenceMedia";

interface VideoPreviewGroupProps {
  data: Evidences[];
}

const IMAGE_NOT_FOUND =
  "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";

/**
 * Single evidence video, fetched authenticated and played from a blob URL.
 */
const AuthenticatedVideo = ({
  evidence,
  className,
  controls = true,
  autoPlay = false,
  onClick,
}: {
  evidence: Evidences;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  onClick?: () => void;
}) => {
  const { url, error } = useAuthenticatedMedia(evidence.evidenceName);

  if (error || !url) {
    return (
      <img
        src={IMAGE_NOT_FOUND}
        alt={`Fallback for video with ID ${evidence.id}`}
        className={className}
      />
    );
  }

  return (
    <video
      className={className}
      src={url}
      controls={controls}
      autoPlay={autoPlay}
      onClick={onClick}
    />
  );
};

const VideoPreviewGroup = ({ data }: VideoPreviewGroupProps) => {
  const videos = data
    .filter(isVideoEvidence)
    .sort((a, b) =>
      a.evidenceName.toLowerCase().localeCompare(b.evidenceName.toLowerCase())
    );

  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(
    null
  );

  const handleOpenModal = (index: number) => setCurrentVideoIndex(index);
  const handleCloseModal = () => setCurrentVideoIndex(null);
  const handleNextVideo = () =>
    setCurrentVideoIndex((prev) =>
      prev !== null && prev < videos.length - 1 ? prev + 1 : prev
    );
  const handlePreviousVideo = () =>
    setCurrentVideoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));

  return (
    <div>
      <div className="rounded-md p-1 mb-1 bg-white">
        <h1 className="font-semibold">{Strings.videos}</h1>
      </div>
      <div className="flex flex-wrap gap-4">
        {videos.map((video, index) => (
          <div key={video.id || `fallback-id-${index}`} className="video-thumbnail">
            <AuthenticatedVideo
              evidence={video}
              className="w-[200px] h-auto rounded-lg cursor-pointer"
              onClick={() => handleOpenModal(index)}
            />
          </div>
        ))}
      </div>
      {currentVideoIndex !== null && (
        <Modal
          open={true}
          footer={null}
          onCancel={handleCloseModal}
          width="80%"
          style={{ padding: 0 }}
        >
          <div className="relative flex items-center">
            {currentVideoIndex > 0 && (
              <button
                className="absolute left-0 z-10 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
                style={{ top: "50%", transform: "translateY(-50%)" }}
                onClick={handlePreviousVideo}
              >
                <LeftOutlined style={{ fontSize: "24px" }} />
              </button>
            )}
            <AuthenticatedVideo
              key={videos[currentVideoIndex]?.id}
              evidence={videos[currentVideoIndex]}
              className="mx-auto w-full"
              autoPlay
            />
            {currentVideoIndex < videos.length - 1 && (
              <button
                className="absolute right-0 z-10 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
                style={{ top: "50%", transform: "translateY(-50%)" }}
                onClick={handleNextVideo}
              >
                <RightOutlined style={{ fontSize: "24px" }} />
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideoPreviewGroup;
