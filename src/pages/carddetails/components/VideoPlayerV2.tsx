import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import sectionsTitlesCardDetails from "../../../components/SectionsTitlesCardDetails";
import Strings from "../../../utils/localizations/Strings";
import { Evidences } from "../../../data/card/card";
import { isVideoURL } from "../../../utils/Extensions";

interface CardProps {
  data: Evidences[];
}

const VideoPlayerV2 = ({ data }: CardProps) => {
  // Filtra y ordena los videos
  const videos = data
    .filter((evidence) => isVideoURL(evidence.evidenceName))
    .sort((a, b) => {
      // Ordena de acuerdo al nombre del archivo o según otro criterio si lo prefieres
      const nameA = a.evidenceName.toLowerCase();
      const nameB = b.evidenceName.toLowerCase();
      return nameA.localeCompare(nameB); // Orden ascendente
    });

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());
  const [videoNoVisual, setVideoNoVisual] = useState<Set<string>>(new Set());

  const handleVideoError = (id: string) => {
    setVideoErrors((prevErrors) => new Set(prevErrors).add(id));
  };

  const checkVideoVisual = (id: string, index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setVideoNoVisual((prevNoVisual) => new Set(prevNoVisual).add(id));
      } else {
        setVideoNoVisual((prevNoVisual) => {
          const updated = new Set(prevNoVisual);
          updated.delete(id);
          return updated;
        });
      }
    }
  };

  const handleOpenModal = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleCloseModal = () => {
    setCurrentVideoIndex(null);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) =>
      prev !== null && prev < videos.length - 1 ? prev + 1 : prev
    );
  };

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : prev
    );
  };

  useEffect(() => {
    return () => {
      videoRefs.current = [];
    };
  }, []);

  return (
    <div>
      {sectionsTitlesCardDetails(Strings.videos)}
      <div className="flex flex-wrap gap-4">
        {videos.map((video, index) => {
          const videoId = video.id || `fallback-id-${index}`;
          const hasError = videoErrors.has(videoId);
          const noVisual = videoNoVisual.has(videoId);

          return (
            <div key={videoId} className="video-thumbnail">
              {hasError || noVisual ? (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                  alt={`Fallback for video with ID ${videoId}`}
                  className="w-[200px] h-auto rounded-lg"
                />
              ) : (
                <video
                  ref={(videoItem) => {
                    videoRefs.current[index] = videoItem;
                    if (videoItem) {
                      videoItem.onloadeddata = () => checkVideoVisual(videoId, index);
                    }
                  }}
                  className="w-[200px] h-auto rounded-lg cursor-pointer"
                  src={video.evidenceName}
                  controls
                  onClick={() => handleOpenModal(index)}
                  onError={() => handleVideoError(videoId)}
                />
              )}
            </div>
          );
        })}
      </div>
      {currentVideoIndex !== null && (
        <Modal
          visible={true}
          footer={null}
          onCancel={handleCloseModal}
          width="80%"
          bodyStyle={{ padding: 0 }}
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
            <video
              className="mx-auto w-full"
              src={videoErrors.has(videos[currentVideoIndex]?.id)
                ? "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                : videos[currentVideoIndex]?.evidenceName}
              controls
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

export default VideoPlayerV2;
