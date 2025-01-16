"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ImagePreviewSection from "./ImageRow";

type ImageFile = File | null;
type EncryptionKey = Object | undefined;

export default function RSAES() {
  const [image, setImage] = useState<ImageFile>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [encryptedImageUrl, setEncryptedImageUrl] = useState<
    string | undefined
  >(undefined);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState<
    string | undefined
  >(undefined);
  const [encryptionKey, setEncryptionKey] = useState<EncryptionKey>(undefined);
  const [ivector, setIV] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const BASE_URL = "http://152.42.156.81";

  useEffect(() => {
    const fetchEncryptionKey = async () => {
      try {
        const formData = new FormData();
        formData.append("type", "RSA");
        const response = await axios.get(`${BASE_URL}/generate-key`, formData);
        console.log(response);
        const key = response.data.key;
        console.log(key);
        setEncryptionKey(key);
      } catch (error) {
        alert("Error fetching encryption key:");
      }
    };

    fetchEncryptionKey(); // Call the function when the component mounts
  }, []);

  const handleEncryptImage = async () => {
    if (!image) return alert("Please upload an image first.");

    setLoading(true);
    try {
      const formData = new FormData();
      if (image && encryptionKey) {
        formData.append("image", image);
        formData.append("type", "notrsa");
      }

      const response = await axios.post(`${BASE_URL}/encrypt-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // Expect binary data as response
      });

      const iv = response.headers["x-iv"];
      if (!iv) throw new Error("No iv");
      const Width = response.headers["x-width"];
      const Height = response.headers["x-height"];
      const byteSize = response.headers["x-datalength"];
      if (!Width) throw new Error("No Width");
      if (!Height) throw new Error("No Height");
      if (!byteSize) throw new Error("No byteSize");

      const encryptedUrl = URL.createObjectURL(response.data);
      setEncryptedImageUrl(encryptedUrl);
      setIV(iv);
    } catch (error) {
      console.error("Encryption failed:", error);
      alert("Encryption failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full flex flex-col justify-center items-center pt-5">
      <h1 className="text-4xl font-bold">RSAES</h1>
    </main>
  );
}
