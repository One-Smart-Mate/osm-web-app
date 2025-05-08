import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface, Evidences } from "../../../data/card/card";
import {
  formatDate,
  getDaysBetween,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import { Card, Divider, Typography } from "antd";
import ImagesDisplayV2 from "./ImagesDisplayV2";
import VideoPlayerV2 from "./VideoPlayerV2";
import AudioPlayer from "./AudioPlayer";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";

const { Text } = Typography;

interface CardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const DefinitiveSolutionCollapseV2 = ({ data, evidences }: CardProps) => {
  const { card } = data;

  return (
    <Card hoverable>
      <div className="grid grid-rows-5 gap-y-4 gap-x-8 sm:grid-rows-none sm:gap-4 sm:px-4">
        <Divider style={{ borderColor: "#808080" }}>
          <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
            {Strings.definitiveSolutionDivider}
          </Text>
        </Divider>

        <AnatomySection
          title={Strings.tagDate}
          label={formatDate(card.cardDefinitiveSolutionDate) || Strings.NA}
        />

        <AnatomySection
          title={Strings.tagDays}
          label={
            getDaysBetween(card.createdAt, card.cardDefinitiveSolutionDate) ||
            Strings.ceroDays
          }
        />

        <AnatomySection
          title={Strings.appDefinitiveUser}
          label={card.userAppDefinitiveSolutionName || Strings.NA}
        />

        <AnatomySection
          title={Strings.definitiveUser}
          label={card.userDefinitiveSolutionName || Strings.NA}
        />

        <AnatomySection
          title={Strings.definitiveSolutionApplied}
          label={card.commentsAtCardDefinitiveSolution || Strings.NA}
        />

        {hasImages(evidences) ||
          hasVideos(evidences) ||
          (hasAudios(evidences) && (
            <>
              <Divider
                orientation="left"
                style={{ borderColor: "#808080" }}
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
                {hasVideos(evidences) && <VideoPlayerV2 data={evidences} />}
              </div>

              <div className="flex justify-center gap-2 flex-wrap mt-2">
                {hasAudios(evidences) && <AudioPlayer data={evidences} />}
              </div>
            </>
          ))}
      </div>
    </Card>
  );
};

export default DefinitiveSolutionCollapseV2;
