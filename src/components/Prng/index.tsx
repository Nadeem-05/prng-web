"use client";

import { useState } from "react";
import axios from "axios";

type ImageFile = File | null;

export default function Home() {
  const [image, setImage] = useState<ImageFile>(null);
  const [encryptedImageURL, setEncryptedImageURL] = useState<string | null>(null);
  const [decryptedImageURL, setDecryptedImageURL] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
	  const [dataLength, setDataLength] = useState<number| null>(null);

	const flaskUrl = process.env.NEXT_PUBLIC_LOCAL_URL;

console.log(flaskUrl);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg")
    ) {
      setImage(file);
      setEncryptedImageURL(null);
      setDecryptedImageURL(null);
      setEncryptionKey(null);
    } else {
      alert("Please upload a valid image file (jpg, jpeg, or png).");
    }
  };
const handleEncryptImage = async () => {
  if (!image) return;

  const formData = new FormData();
  formData.append("image", image);

  try {
    const response = await axios.post(`${flaskUrl}/encrypt-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });

    const encryptionKey = response.headers["x-encryption-key"]; 
    const dataLength = response.headers["x-data-length"];

    const blob = response.data; // No need to re-wrap as a Blob
    const encryptedImageURL = URL.createObjectURL(blob);

    setEncryptedImageURL(encryptedImageURL);
    setEncryptionKey(encryptionKey);
    setDataLength(dataLength);
    
  } catch (error) {
    console.error("Encryption failed:", error);
    alert(`Failed to encrypt the image. Error: ${error.message}`);
  }
};

const handleDecryptImage = async () => {
  if (!encryptedImageURL || !encryptionKey) {
    alert("Please encrypt the image first.");
    return;
  }

  try {
    const response = await fetch(encryptedImageURL);
    const encryptedBlob = await response.blob();

    const formData = new FormData();
    formData.append("file", encryptedBlob, "encrypted_image.png");
    formData.append("key", encryptionKey); 

    const decryptResponse = await axios.post(`${flaskUrl}/decrypt-image`, formData, {
      responseType: "blob",
      headers: { "X-Data-Length": dataLength },
    });

    const blob = decryptResponse.data;
    const decryptedURL = URL.createObjectURL(blob);

    setDecryptedImageURL(decryptedURL);
  } catch (error) {
    console.error("Decryption failed:", error);
    alert(`Failed to decrypt the image. Error: ${error.message}`);
  }
};


  const handleRemoveImage = () => {
    setImage(null);
    setEncryptedImageURL(null);
    setDecryptedImageURL(null);
    setEncryptionKey(null);
  };

  return (
    <main className="w-full flex flex-col justify-between pt-5">
      {image ? (
        <section className="flex flex-col">
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded Preview"
            className="w-72 h-72 object-cover rounded mb-4"
          />
          <p className="text-sm text-gray-600">File Name: {image.name}</p>
          <p className="text-sm text-gray-600">
            File Size: {(image.size / 1024).toFixed(2)} KB
          </p>
          <button
            onClick={handleEncryptImage}
            className="bg-blue-400 hover:bg-blue-600 text-white rounded w-80 h-12 mt-4"
          >
            Encrypt Image
          </button>
          {encryptedImageURL && (
            <div>
              <img
                src={encryptedImageURL}
                alt="Encrypted Preview"
                className="w-72 h-72 object-cover rounded mt-4"
              />
              <button
                onClick={handleDecryptImage}
                className="bg-green-400 hover:bg-green-600 text-white rounded w-80 h-12 mt-4"
              >
                Decrypt Image
              </button>
            </div>
          )}
          {decryptedImageURL && (
            <img
              src={decryptedImageURL}
              alt="Decrypted Preview"
              className="w-72 h-72 object-cover rounded mt-4"
            />
          )}
          <button
            onClick={handleRemoveImage}
            className="bg-red-400 hover:bg-red-600 text-white rounded w-80 h-12 mt-4"
          >
            Remove Image
          </button>
        </section>
      ) : (
        <section className="flex flex-col">
          <label
            htmlFor="imageUpload"
            className="bg-gray-200 hover:bg-green-400 rounded w-80 h-12 flex items-center justify-center cursor-pointer"
          >
            + Upload Image
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleImageUpload}
            className="hidden"
          />
        </section>
      )}

      {/* Uploaded Image Preview */}
      {image && (
        <section className="flex flex-col items-center">
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded Preview"
            className="w-72 h-72 object-cover rounded mb-4"
          />
          <p className="text-sm text-gray-600">File Name: {image.name}</p>
          <p className="text-sm text-gray-600">
            File Size: {(image.size / 1024).toFixed(2)} KB
          </p>
          <button
            onClick={handleEncryptImage}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded w-80 h-12 mt-4"
            disabled={loading}
          >
            {loading ? "Encrypting..." : "Encrypt Image"}
          </button>
        </section>
      )}

      {/* Encrypted Image Preview */}
      {encryptedImageUrl && (
        <section className="flex flex-col items-center mt-4">
          <h3 className="text-lg font-semibold">Encrypted Image</h3>
          <img
            src={encryptedImageUrl}
            alt="Encrypted Preview"
            className="w-72 h-72 object-cover rounded mb-2"
          />
          <p className="text-sm text-gray-600">Encryption Key: {encryptionKey}</p>
          <button
            onClick={handleDecryptImage}
            className="bg-green-500 hover:bg-green-600 text-white rounded w-80 h-12 mt-4"
            disabled={loading}
          >
            {loading ? "Decrypting..." : "Decrypt Image"}
          </button>
        </section>
      )}

      {/* Decrypted Image Preview */}
      {decryptedImageUrl && (
        <section className="flex flex-col items-center mt-4">
          <h3 className="text-lg font-semibold">Decrypted Image</h3>
          <img
            src={decryptedImageUrl}
            alt="Decrypted Preview"
            className="w-72 h-72 object-cover rounded mb-2"
          />
        </section>
      )}

      {/* Reset Button */}
      {(image || encryptedImageUrl || decryptedImageUrl) && (
        <button
          onClick={handleRemoveAll}
          className="bg-red-500 hover:bg-red-600 text-white rounded w-80 h-12 mt-4"
        >
          Remove All
        </button>
      )}
    </main>
  );
}
