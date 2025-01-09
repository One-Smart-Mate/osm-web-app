import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface, Evidences } from "../../../data/card/card";
import {
  formatDate,
  getDaysBetween,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import { Divider, Typography } from "antd";
import VideosDisplayV2 from "./VideoPlayerV2";
import ImagesDisplayV2 from "./ImagesDisplayV2";
import AudiosDisplayV2 from "./AudioPlayer";

const { Text } = Typography;

interface CardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const DefinitiveSolutionCollapseV2 = ({ data, evidences }: CardProps) => {
  const { card } = data;

  return (
    <div className="grid grid-rows-5 gap-y-4 gap-x-8 sm:grid-rows-none sm:gap-4 sm:px-4">
      <Divider style={{ borderColor: "	#808080" }}>
        <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
          {Strings.definitiveSolutionDivider}
        </Text>
      </Divider>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm md:text-base">
          {Strings.tagDate}
        </span>
        <p className="text-sm md:text-base">
          {formatDate(card.cardDefinitiveSolutionDate) || Strings.NA}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm md:text-base">
          {Strings.tagDays}
        </span>
        <p className="text-sm md:text-base">
          {getDaysBetween(card.createdAt, card.cardDefinitiveSolutionDate) ||
            Strings.ceroDays}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm md:text-base">
          {Strings.appDefinitiveUser}
        </span>
        <p className="text-sm md:text-base">
          {card.userAppDefinitiveSolutionName || Strings.NA}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm md:text-base">
          {" "}
          {Strings.definitiveUser}
        </span>
        <p className="text-sm md:text-base">
          {" "}
          {card.userDefinitiveSolutionName || Strings.NA}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm md:text-base">
          {" "}
          {Strings.definitiveSolutionApplied}
        </span>
        <p className="text-sm md:text-base">
          {" "}
          {card.commentsAtCardDefinitiveSolution || Strings.NA}
        </p>
      </div>

      <Divider
        orientation="left"
        style={{ borderColor: "	#808080" }}
        className="text-sm md:text-base"
      >
        {Strings.evidencesAtDefinitiveDivider}
      </Divider>

      <div className="flex gap-3">
        {evidences.length === 0 && (
          <p className="text-base text-gray-700">{Strings.NA}</p>
        )}
      </div>

      <div className="flex justify-center gap-2 flex-wrap mt-2">
        {hasImages(evidences) && <ImagesDisplayV2 data={evidences} />}
      </div>

      <div className="flex justify-center gap-2 flex-wrap mt-2">
        {hasVideos(evidences) && <VideosDisplayV2 data={evidences} />}
      </div>

      <div className="flex justify-center gap-2 flex-wrap mt-2">
        {hasAudios(evidences) && <AudiosDisplayV2 data={evidences} />}
      </div>
    </div>
  );
};

export default DefinitiveSolutionCollapseV2;
