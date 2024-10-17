import React, { useState } from "react";
import { MdFullscreen } from "react-icons/md";
import Strings from "../utils/localizations/Strings";
import { Image } from "antd";

interface ImageProps {
  src: string;
  alt: string;
  [key: string]: any;
}

const CustomImage: React.FC<ImageProps> = ({ src, alt, ...props }) => {
  const [isLandScape, setLandScape] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(Strings.empty);

  const handleOnPreview = () => {
    setPreviewImage(src);
    setPreviewOpen(true);
  };

  const handleImageLoad = (event: any) => {
    const { naturalWidth, naturalHeight } = event.target;
    if (naturalWidth > naturalHeight) {
      setLandScape(true);
    }
  };

  return (
    <>
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className={isLandScape ? "my-24" : "size-96"}
          onLoad={handleImageLoad}
          {...props}
        />
        <button
          onClick={handleOnPreview}
          className="flex justify-center items-center bg-dark-gradient absolute right-3 bottom-3 size-9 hover:bg-custom-gray rounded-full p-1"
        >
          <MdFullscreen className="text-white size-5" />
        </button>
      </div>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default CustomImage;
