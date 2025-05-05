import { Carousel } from "antd";
import sectionsTitlesCardDetails from "../../../components/SectionsTitlesCardDetails";
import Strings from "../../../utils/localizations/Strings";
import { Evidences } from "../../../data/card/card";
import { isVideoURL } from "../../../utils/Extensions";
import { useEffect, useRef } from "react";

interface CardProps {
  data: Evidences[];
}

const VideosCarousel = ({ data }: CardProps) => {
  const videos = data.filter((evidence) => isVideoURL(evidence.evidenceName));

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleBeforeChange = (from: number) => {
    if (videoRefs.current[from]) {
      videoRefs.current[from]?.pause();
    }
  };

  useEffect(() => {
    return () => {
      videoRefs.current = [];
    };
  }, []);

  return (
    <div className="md:w-64 w-60 rounded-lg p-1 bg-card-fields">
      {sectionsTitlesCardDetails(Strings.videos)}
      <Carousel arrows infinite={false} beforeChange={handleBeforeChange}>
        {videos.map((video, index) => (
          <div key={video.id}>
            <video
              ref={(el) => {
                if (el) {
                  videoRefs.current[index] = el;
                }
              }}
              className="size-96"
              src={video.evidenceName}
              controls
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default VideosCarousel;
