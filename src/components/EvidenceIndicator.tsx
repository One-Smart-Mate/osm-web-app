import { useMemo } from "react";
import { hasAudios, hasImages, hasVideos } from "../utils/Extensions";
import { GoDeviceCameraVideo } from "react-icons/go";
import { AiOutlinePicture } from "react-icons/ai";
import { IoHeadsetOutline } from "react-icons/io5";
import { Evidences } from "../data/card/card";

const EvidenceIndicator = (evidences: Evidences[]) => {
  const elements = useMemo(() => {
    const elems: JSX.Element[] = [];
    if (hasImages(evidences)) {
      elems.push(<AiOutlinePicture className="h-full size-5" key="images" />);
    }
    if (hasVideos(evidences)) {
      elems.push(
        <GoDeviceCameraVideo className="h-full size-5" key="videos" />
      );
    }
    if (hasAudios(evidences)) {
      elems.push(<IoHeadsetOutline className="h-full size-5" key="audios" />);
    }
    return elems;
  }, [evidences]);

  return <div className="flex gap-1 text-black flex-row">{elements}</div>;
};

export default EvidenceIndicator;
