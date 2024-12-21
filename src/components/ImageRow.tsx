import React, { useState } from "react";

interface ImagePreviewSectionProps {
  uploadedImageUrl?: string;
  encryptedImageUrl?: string;
  decryptedImageUrl?: string;
  encryptionKey?: string;
}

const ImagePreviewSection: React.FC<ImagePreviewSectionProps> = ({
  uploadedImageUrl,
  encryptedImageUrl,
  decryptedImageUrl,
  encryptionKey,
}) => {
  const [uploadedImageSize, setUploadedImageSize] = useState<string | null>(
    null,
  );
  const [encryptedImageSize, setEncryptedImageSize] = useState<string | null>(
    null,
  );
  const [decryptedImageSize, setDecryptedImageSize] = useState<string | null>(
    null,
  );

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    setSize: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setSize(`${naturalWidth} x ${naturalHeight}`);
  };

  return (
    <section className="flex flex-row  flex-wrap w-full justify-center mt-4">
      {uploadedImageUrl && (
        <section className="flex flex-col items-center cursor-pointer">
          <h3 className="text-lg font-semibold">Uploaded Image</h3>
          <img
            src={uploadedImageUrl}
            alt="Uploaded Preview"
            className="object-contain mb-2"
            onLoad={(e) => handleImageLoad(e, setUploadedImageSize)}
          />
          {uploadedImageSize && (
            <p className="text-sm text-gray-500">Size: {uploadedImageSize}</p>
          )}
        </section>
      )}

      {encryptedImageUrl && (
        <section className="flex flex-col items-center cursor-pointer ml-5">
          <h3 className="text-lg font-semibold">Encrypted Image</h3>
          <img
            src={encryptedImageUrl}
            alt="Encrypted Preview"
            className="object-contain mb-2"
            onLoad={(e) => handleImageLoad(e, setEncryptedImageSize)}
          />
          {encryptedImageSize && (
            <p className="text-sm text-gray-500">Size: {encryptedImageSize}</p>
          )}
          <p className="bg-black hover:bg-white text-black px-2 py-1 mt-2">
            Encryption Key: {encryptionKey}
          </p>
        </section>
      )}

      {decryptedImageUrl && (
        <section className="flex flex-col items-center cursor-pointer">
          <h3 className="text-lg font-semibold">Decrypted Image</h3>
          <img
            src={decryptedImageUrl}
            alt="Decrypted Preview"
            className="object-contain mb-2"
            onLoad={(e) => handleImageLoad(e, setDecryptedImageSize)}
          />
          {decryptedImageSize && (
            <p className="text-sm text-gray-500">Size: {decryptedImageSize}</p>
          )}
        </section>
      )}
    </section>
  );
};

export default ImagePreviewSection;
