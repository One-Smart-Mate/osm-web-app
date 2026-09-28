import { Image } from "antd";
import { Evidences } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";
import {
  isImageEvidence,
  useAuthenticatedMedia,
} from "../../../utils/evidenceMedia";

interface CardProps {
  data: Evidences[];
}

const IMAGE_NOT_FOUND =
  "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";

/**
 * Renders a single evidence image. Evidences are stored as authenticated
 * service routes, so the binary is fetched with the Bearer token and shown via
 * a blob URL (see useAuthenticatedMedia).
 */
const AuthenticatedImage = ({ evidence }: { evidence: Evidences }) => {
  const { url, loading, error } = useAuthenticatedMedia(evidence.evidenceName);

  return (
    <Image
      width={200}
      src={error || (!url && !loading) ? IMAGE_NOT_FOUND : url}
      placeholder={loading}
      fallback={IMAGE_NOT_FOUND}
      alt={`Image of evidence with ID ${evidence.id}`}
    />
  );
};

const ImagesPreviewGroup = ({ data }: CardProps) => {
  // Classify by evidenceType (IM*) and sort by name for a stable order.
  const images = data
    .filter(isImageEvidence)
    .sort((a, b) =>
      a.evidenceName.toLowerCase().localeCompare(b.evidenceName.toLowerCase())
    );

  return (
    <div>
      <div className="rounded-md p-1 mb-1 bg-white">
        <h1 className="font-semibold">{Strings.images}</h1>
      </div>
      {images.length > 0 ? (
        <Image.PreviewGroup preview={{}}>
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <AuthenticatedImage
                key={image.id || `fallback-id-${index}`}
                evidence={image}
              />
            ))}
          </div>
        </Image.PreviewGroup>
      ) : (
        <div className="text-center p-4">
          <Image width={200} src={IMAGE_NOT_FOUND} alt="No images available" />
        </div>
      )}
    </div>
  );
};

export default ImagesPreviewGroup;
