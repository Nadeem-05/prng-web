"use client";

import { useState } from "react";
import axios from "axios";

type ImageFile = File | null;

export default function Home() {
  const [image, setImage] = useState<ImageFile>(null);
  const [encryptedImageUrl, setEncryptedImageUrl] = useState<string | null>(null);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [ivector, setIV] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:5000"; // Replace with your API base URL

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg")
    ) {
      setImage(file);
    } else {
      alert("Please upload a valid image file (jpg, jpeg, or png).");
    }
  };

  // Handle image encryption
  const handleEncryptImage = async () => {
    if (!image) return alert("Please upload an image first.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await axios.post(`${BASE_URL}/encrypt-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // Expect binary data as response
      });

      const key = response.headers["x-encryption-key"];
      const iv = response.headers["x-iv"];
      console.log(response.headers);
      if (!key) throw new Error("No encryption key returned.");
      if (!iv) throw new Error("No iv")
      // Convert encrypted blob to URL
      const encryptedUrl = URL.createObjectURL(response.data);
      setEncryptedImageUrl(encryptedUrl);
      setEncryptionKey(key);
      setIV(iv);
      setImage(null); // Remove original image
    } catch (error) {
      console.error("Encryption failed:", error);
      alert("Encryption failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image decryption
  const handleDecryptImage = async () => {
    if (!encryptedImageUrl || !encryptionKey || !ivector) {
      return alert("No encrypted image or key available or ivector available.");
    }

    setLoading(true);
    try {
      const encryptedBlob = await fetch(encryptedImageUrl).then((res) =>
        res.blob()
      );
      const formData = new FormData();
      formData.append("file", encryptedBlob, "encrypted_image.png");
      formData.append("key", encryptionKey);
      formData.append("iv",ivector);

      const response = await axios.post(`${BASE_URL}/decrypt-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // Expect binary data as response
      });

      // Convert decrypted blob to URL
      const decryptedUrl = URL.createObjectURL(response.data);
      setDecryptedImageUrl(decryptedUrl);
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Decryption failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle removing all images
  const handleRemoveAll = () => {
    setImage(null);
    setEncryptedImageUrl(null);
    setDecryptedImageUrl(null);
    setEncryptionKey(null);
    setIV(null);
  };

  return (
    <main className="w-full flex flex-col items-center justify-center pt-5">
      <h1 className="text-2xl font-bold mb-4">Image Encryption and Decryption</h1>

      {/* Upload Image */}
      {!image && !encryptedImageUrl && (
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
