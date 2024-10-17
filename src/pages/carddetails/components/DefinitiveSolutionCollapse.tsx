import { Collapse } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface, Evidences } from "../../../data/card/card";
import {
  formatDate,
  getDaysBetween,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import EvidenceIndicator from "../../../components/EvidenceIndicator";
import ImagesCarousel from "./ImagesCarousel";
import VideosCarousel from "./VideosCarousel";
import AudiosList from "./AudiosList";

interface CardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const DefinitiveSolutionCollapse = ({ data, evidences }: CardProps) => {
  const { card } = data;

  return (
    <Collapse
      collapsible={
        card.cardDefinitiveSolutionDate === null ? "disabled" : undefined
      }
      defaultActiveKey={
        card.cardDefinitiveSolutionDate !== null ? ["1"] : undefined
      }
      className="bg-gray-100 rounded-xl shadow-md md:w-4/5"
    >
      <Collapse.Panel
        header={
          <>
            <div className="flex gap-3">
              <h2 className="text-base font-semibold text-black">
                {Strings.definitiveSolution}
              </h2>
              <p className="text-base text-gray-700">
                {formatDate(card.cardDefinitiveSolutionDate) || Strings.NA}
              </p>
            </div>
          </>
        }
        key="1"
      >
        <div className="flex flex-wrap text-sm gap-2">
          <div className="flex gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <p className="font-semibold"> {Strings.days} </p>{" "}
              <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                {getDaysBetween(
                  card.cardDefinitiveSolutionDate,
                  card.createdAt
                ) || Strings.NA}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold"> {Strings.appDefinitiveUser} </p>{" "}
              <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                {card.userAppDefinitiveSolutionName || Strings.NA}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold"> {Strings.definitiveUser} </p>{" "}
              <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                {card.userDefinitiveSolutionName || Strings.NA}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">
                {" "}
                {Strings.definitiveSolutionApplied}{" "}
              </p>{" "}
              <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                {card.commentsAtCardDefinitiveSolution || Strings.NA}
              </p>
            </div>
          </div>
        </div>
        <Collapse className="border-black mt-2 rounded-xl shadow-md">
          <Collapse.Panel
            key="2"
            header={
              <>
                <div className="flex gap-3">
                  <h2 className="text-base font-semibold text-black">
                    {Strings.evidences}
                  </h2>
                  {evidences.length === 0 && (
                    <p className="text-base text-gray-700">{Strings.NA}</p>
                  )}
                  {EvidenceIndicator(evidences)}
                </div>
              </>
            }
          >
            <div className="flex justify-center gap-2 flex-wrap">
              {hasImages(evidences) && <ImagesCarousel data={evidences} />}
              {hasVideos(evidences) && <VideosCarousel data={evidences} />}
              {hasAudios(evidences) && <AudiosList data={evidences} />}
            </div>
          </Collapse.Panel>
        </Collapse>
      </Collapse.Panel>
    </Collapse>
  );
};

export default DefinitiveSolutionCollapse;
