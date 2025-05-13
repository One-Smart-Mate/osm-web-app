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
import ImagesPreviewGroup from "./ImagesPreviewGroup";
import VideoPreviewGroup from "./VideoPreviewGroup";
import AudioPlayerPreviewGroup from "./AudioPlayerPreviewGroup";
import AnatomySection from "../../components/AnatomySection";

const { Text } = Typography;

interface DefinitiveSolutionTagCardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const DefinitiveSolutionTagCard = ({ data, evidences }: DefinitiveSolutionTagCardProps) => {
  const { card } = data;

  const showEvidences = (): boolean => {
    return hasImages(evidences) ||
          hasVideos(evidences) ||
          hasAudios(evidences);
  }

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

        {showEvidences() && (
            <>
              <Divider
                orientation="left"
                style={{ borderColor: "#808080" }}
                className="text-sm md:text-base"
              >
                {Strings.evidencesAtDefinitiveDivider}
              </Divider>

              <div className="flex gap-2 flex-wrap mt-2">
                {hasImages(evidences) && <ImagesPreviewGroup data={evidences} />}
              </div>

              <div className="flex  gap-2 flex-wrap mt-2">
                {hasVideos(evidences) && <VideoPreviewGroup data={evidences} />}
              </div>

              <div className="flex gap-2 flex-wrap mt-2">
                {hasAudios(evidences) && <AudioPlayerPreviewGroup data={evidences} />}
              </div>
            </>
          )}
      </div>
    </Card>
  );
};

export default DefinitiveSolutionTagCard;
