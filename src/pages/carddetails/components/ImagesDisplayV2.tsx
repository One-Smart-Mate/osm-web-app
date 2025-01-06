import { useState } from "react";
import { Image } from "antd";
import sectionsTitlesCardDetails from "../../../components/SectionsTitlesCardDetails";
import { Evidences } from "../../../data/card/card";
import { isImageURL } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";

interface CardProps {
  data: Evidences[];
}

const ImagesDisplayV2 = ({ data }: CardProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set()); // Cambiar a Set<string> para manejar IDs de tipo string
  const images = data.filter((evidence) => isImageURL(evidence.evidenceName));

  const handleImageError = (id: string) => {
    setImageErrors((prevErrors) => new Set(prevErrors).add(id));
  };

  return (
    <div>
      {sectionsTitlesCardDetails(Strings.images)}
      {images.length > 0 ? (
        <Image.PreviewGroup
          preview={{
            onChange: (current, prev) =>
              console.log(`current index: ${current}, prev index: ${prev}`),
          }}
        >
          <div className="flex flex-wrap gap-4"> 
            {images.map((image, index) => {
              const imageId = image.id || `fallback-id-${index}`; 
              const hasError = imageErrors.has(image.id);

              return (
                <Image
                  key={imageId}  
                  width={200}
                  src={hasError ? "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png" : image.evidenceName}
                  alt={`Image of evidence with ID ${imageId}`}  
                  onError={() => handleImageError(image.id)}  
                />
              );
            })}
          </div>
        </Image.PreviewGroup>
      ) : (
        <div className="text-center p-4">
          <Image
            width={200}
            src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
            alt="No images available"
          />
        </div>
      )}
    </div>
  );
};

export default ImagesDisplayV2;
