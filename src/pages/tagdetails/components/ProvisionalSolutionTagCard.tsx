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
import AudioPlayerPreviewGroup from "./AudioPlayerPreviewGroup";
import VideoPreviewGroup from "./VideoPreviewGroup";
import AnatomySection from "../../components/AnatomySection";

const { Text } = Typography;

interface ProvisionalSolutionTagCardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const ProvisionalSolutionTagCard = ({ data, evidences }: ProvisionalSolutionTagCardProps) => {
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
            {Strings.provisionalSolutionDivider}
          </Text>
        </Divider>

        <AnatomySection
          title={Strings.tagDate}
          label={formatDate(card.cardProvisionalSolutionDate) || Strings.NA}
        />

        <AnatomySection
          title={Strings.tagDays}
          label={
            getDaysBetween(card.createdAt, card.cardProvisionalSolutionDate) ||
            Strings.ceroDays
          }
        />

        <AnatomySection
          title={Strings.appProvisionalUser}
          label={card.userAppProvisionalSolutionName || Strings.NA}
        />

        <AnatomySection
          title={Strings.tagProvisionalUser}
          label={card.userProvisionalSolutionName || Strings.NA}
        />

        <AnatomySection
          title={Strings.tagProvisionalSoluitonApplied}
          label={card.commentsAtCardProvisionalSolution || Strings.NA}
        />

        {showEvidences() && (
            <>
              <Divider
                orientation="left"
                style={{ borderColor: "#808080" }}
                className="text-sm md:text-base"
              >
                {Strings.evidencesAtProvisionalDivider}
              </Divider>

              <div className="flex  gap-2 flex-wrap mt-2">
                {hasImages(evidences) && <ImagesPreviewGroup data={evidences} />}
              </div>

              <div className="flex gap-2 flex-wrap mt-2">
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

export default ProvisionalSolutionTagCard;
