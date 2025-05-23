import { useState } from "react";
import { Image } from "antd";
import { Evidences } from "../../../data/card/card";
import { isImageURL } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";

interface CardProps {
  data: Evidences[];
}

const ImagesPreviewGroup = ({ data }: CardProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Sort and filter images by name in ascending alphabetical order
  const images = data
    .filter((evidence) => isImageURL(evidence.evidenceName))
    .sort((a, b) => {
      const nameA = a.evidenceName.toLowerCase();
      const nameB = b.evidenceName.toLowerCase();
      return nameA.localeCompare(nameB); // Ascending alphabetical order
    });

  const handleImageError = (id: string) => {
    setImageErrors((prevErrors) => {
      const newErrors = new Set(prevErrors);
      newErrors.add(id);
      return newErrors;
    });
  };

  return (
    <div>
    <div className="rounded-md p-1 mb-1 bg-white">
      <h1 className="font-semibold">{Strings.images}</h1>
    </div>
      {images.length > 0 ? (
        <Image.PreviewGroup preview={{}}>
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => {
              const imageId = image.id || `fallback-id-${index}`;
              const hasError = imageErrors.has(imageId);

              return (
                <Image
                  key={imageId}
                  width={200}
                  src={
                    hasError
                      ? "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                      : image.evidenceName
                  }
                  alt={`Image of evidence with ID ${imageId}`}
                  onError={() => handleImageError(imageId)}
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

export default ImagesPreviewGroup;
