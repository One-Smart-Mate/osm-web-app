import { Carousel } from "antd";
import sectionsTitlesCardDetails from "../../../components/SectionsTitlesCardDetails";
import { Evidences } from "../../../data/card/card";
import { isImageURL } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import CustomImage from "../../../components/CustomImage";

interface CardProps {
  data: Evidences[];
}

const ImagesCarousel = ({ data }: CardProps) => {
  const images = data.filter((evidence) => isImageURL(evidence.evidenceName));
  return (
    <div className="md:w-64 w-60 rounded-lg p-1 bg-card-fields">
      {sectionsTitlesCardDetails(Strings.images)}
      <Carousel arrows infinite={false}>
        {images.map((image) => (
          <div key={image.id}>
            <CustomImage
              src={image.evidenceName}
              alt={`Image of evidence with ID ${image.id}`}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImagesCarousel;
