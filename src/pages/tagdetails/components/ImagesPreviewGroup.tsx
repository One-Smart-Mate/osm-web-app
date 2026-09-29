import { useState, type CSSProperties } from "react";
import { Image, Progress } from "antd";
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
 *
 * The grid shows a small cached thumbnail (fast). The full-resolution image is
 * fetched ONLY when the preview is opened; while it downloads the preview shows
 * a progress bar (never the blurry upscaled thumbnail), and swaps to the sharp
 * image once it is ready.
 */
const AuthenticatedImage = ({ evidence }: { evidence: Evidences }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const thumb = useAuthenticatedMedia(evidence.evidenceName, true);
  // Fetch the full-resolution image only after the preview is opened.
  const full = useAuthenticatedMedia(
    previewOpen ? evidence.evidenceName : ""
  );

  const gridSrc =
    thumb.error || (!thumb.url && !thumb.loading)
      ? IMAGE_NOT_FOUND
      : thumb.url;

  const fullReady = Boolean(full.url) && !full.loading && !full.error;

  return (
    <Image
      width={200}
      src={gridSrc}
      placeholder={thumb.loading}
      fallback={IMAGE_NOT_FOUND}
      preview={{
        // Pass the full image only when it is ready; until then the custom
        // renderer below shows a progress bar instead of the upscaled thumbnail.
        src: fullReady ? full.url : IMAGE_NOT_FOUND,
        onVisibleChange: (visible) => {
          setPreviewOpen(visible);
        },
        imageRender: (originalNode) => {
          if (full.error) {
            return (
              <div style={loadingBoxStyle}>
                <span style={{ color: "#fff" }}>{Strings.failedToDownload}</span>
              </div>
            );
          }
          if (!fullReady) {
            return (
              <div style={loadingBoxStyle}>
                <Progress
                  type="circle"
                  percent={full.progress}
                  size={90}
                  strokeColor="#1677ff"
                />
                <span style={{ color: "#fff", marginTop: 12 }}>
                  {Strings.loading}
                </span>
              </div>
            );
          }
          return originalNode;
        },
      }}
      alt={`Image of evidence with ID ${evidence.id}`}
    />
  );
};

const loadingBoxStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 220,
  minWidth: 220,
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
