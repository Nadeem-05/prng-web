"use client";

import { useState } from "react";
import axios from "axios";

type ImageFile = File | null;

export default function Home() {
  const [image, setImage] = useState<ImageFile>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [encryptedImageUrl, setEncryptedImageUrl] = useState<string | null>(
    null,
  );
  const [decryptedImageUrl, setDecryptedImageUrl] = useState<string | null>(
    null,
  );
  const [decryptedImageSize, setDecryptedImageSize] = useState<number | null>(
    null,
  );
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [ivector, setIV] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<Record<
    string,
    string
  > | null>(null);
  const [plotresult, setPlotResult] = useState<Record<string, string> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [ploting, setPloting] = useState(false);

  const BASE_URL = "http://127.0.0.1:5000"; // Replace with your API base URL

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
      setUploadedImageUrl(URL.createObjectURL(file)); // Generate and store the URL once
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
      if (!key) throw new Error("No encryption key returned.");
      if (!iv) throw new Error("No iv");

      const encryptedUrl = URL.createObjectURL(response.data);
      setEncryptedImageUrl(encryptedUrl);
      setEncryptionKey(key);
      setIV(iv);
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
        res.blob(),
      );
      const formData = new FormData();
      formData.append("file", encryptedBlob, "encrypted_image.png");
      formData.append("key", encryptionKey);
      formData.append("iv", ivector);

      const response = await axios.post(`${BASE_URL}/decrypt-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // Expect binary data as response
      });

      // Convert decrypted blob to URL
      const decryptedUrl = URL.createObjectURL(response.data);
      setDecryptedImageUrl(decryptedUrl);

      // Set the size of the decrypted image
      setDecryptedImageSize(response.data.size);
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Decryption failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = (imageUrl: string) => {
    // Toggle image selection
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageUrl));
    } else if (selectedImages.length < 2) {
      setSelectedImages([...selectedImages, imageUrl]);
    } else {
      alert("You can only select up to 2 images for comparison.");
    }
  };

  const handleCompareImages = async () => {
    if (selectedImages.length !== 2) {
      return alert("Please select exactly two images to compare.");
    }

    setLoading(true);

    try {
      // Fetch the selected images as blobs
      const [originalBlob, encryptedBlob] = await Promise.all(
        selectedImages.map((imageUrl) =>
          fetch(imageUrl).then((res) => res.blob()),
        ),
      );

      // Create FormData for both requests
      const formDataCompare = new FormData();
      formDataCompare.append(
        "original_image",
        originalBlob,
        "original_image.png",
      );
      formDataCompare.append(
        "decrypted_image",
        encryptedBlob,
        "decrypted_image.png",
      );

      const formDataCorr = new FormData();
      formDataCorr.append("original_image", originalBlob, "original_image.png");
      formDataCorr.append(
        "encrypted_image",
        encryptedBlob,
        "encrypted_image.png",
      );

      // Send requests to both endpoints concurrently
      const [compareResponse, corrResponse, plotResponse1, plotResponse2] =
        await Promise.all([
          axios.post(`${BASE_URL}/compare-images`, formDataCompare, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
          axios.post(`${BASE_URL}/corr-calc`, formDataCorr, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
        ]);
      console.log(compareResponse.data);
      console.log(corrResponse.data);

      // Update state with responses
      setComparisonResult({
        compare: compareResponse.data,
        correlation: corrResponse.data,
      });
    } catch (error) {
      console.error("Error during comparison and correlation:", error);
      alert(
        "An error occurred during image comparison or correlation. Check console for details.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handlePlotImage = async () => {
    if (selectedImages.length !== 2) {
      return alert("Please select exactly two images to compare.");
    }

    setPloting(true);

    try {
      // Fetch the selected images as blobs
      const [originalBlob, encryptedBlob] = await Promise.all(
        selectedImages.map((imageUrl) =>
          fetch(imageUrl).then((res) => res.blob()),
        ),
      );
      const formDataPlot = new FormData();
      formDataPlot.append("original_image", originalBlob, "original_image.png");
      formDataPlot.append(
        "encrypted_image",
        encryptedBlob,
        "encrypted_image.png",
      );
      const [plotResponse1, plotResponse2] = await Promise.all([
        axios.post(`${BASE_URL}/plot`, formDataPlot, {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }),
        axios.post(`${BASE_URL}/plot1`, formDataPlot, {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }),
      ]);
      console.log(plotResponse1.data);
      console.log(plotResponse2.data);
      const plotUrl1 = URL.createObjectURL(plotResponse1.data);
      const plotUrl2 = URL.createObjectURL(plotResponse2.data);
      setPlotResult({
        plot1: plotUrl1,
        plot2: plotUrl2,
      });
    } catch (error) {
      console.error("Error during plotting:", error);
      alert(
        "An error occurred during image comparison or correlation. Check console for details.",
      );
    } finally {
      setPloting(false);
    }
  };

  const handleRemoveSelection = () => {
    console.log(selectedImages.length);
    setSelectedImages([]);
    console.log(selectedImages.length);
  };

  // Handle removing all images
  const handleRemoveAll = () => {
    setImage(null);
    setUploadedImageUrl(null);
    setEncryptedImageUrl(null);
    setDecryptedImageUrl(null);
    setDecryptedImageSize(null);
    setComparisonResult(null);
    setEncryptionKey(null);
    setIV(null);
  };

  return (
    <main className="w-full flex flex-col justify-center items-center pt-5">
      {/* Upload Image */}
      {!image && !encryptedImageUrl && (
        <section className="flex flex-col w-full">
          <label
            htmlFor="imageUpload"
            className="bg-gray-200 hover:bg-green-400 rounded w-1/3 h-10 flex items-center justify-center cursor-pointer"
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

      <section className="flex flex-row gap-6 mt-4">
        {uploadedImageUrl && (
          <section
            onClick={() => handleImageSelection(uploadedImageUrl)}
            className={`flex flex-col items-center cursor-pointer ${
              selectedImages.includes(uploadedImageUrl)
                ? "border-4 p-2 border-blue-500"
                : ""
            }`}
          >
            <h3 className="text-lg font-semibold">Uploaded Image</h3>
            <img
              src={uploadedImageUrl}
              alt="Uploaded Preview"
              className="w-80 h-80 object-contain mb-2"
            />
          </section>
        )}

        {encryptedImageUrl && (
          <section
            onClick={() => handleImageSelection(encryptedImageUrl)}
            className={`flex flex-col items-center cursor-pointer ${
              selectedImages.includes(encryptedImageUrl)
                ? "border-4 p-2 border-blue-500"
                : ""
            }`}
          >
            <h3 className="text-lg font-semibold">Encrypted Image</h3>
            <img
              src={encryptedImageUrl}
              alt="Encrypted Preview"
              className="w-80 h-80 object-contain mb-2"
            />
            <p className="bg-black hover:bg-white">
              {" "}
              Encryption Key : {encryptionKey}
            </p>
          </section>
        )}

        {decryptedImageUrl && (
          <section
            onClick={() => handleImageSelection(decryptedImageUrl)}
            className={`flex flex-col items-center cursor-pointer ${
              selectedImages.includes(decryptedImageUrl)
                ? "border-4 p-2 border-blue-500"
                : ""
            }`}
          >
            <h3 className="text-lg font-semibold">Decrypted Image</h3>
            <img
              src={decryptedImageUrl}
              alt="Decrypted Preview"
              className="w-80 h-80 object-contain mb-2"
            />
          </section>
        )}
      </section>
      <section className="flex flex-row justify-center w-full flex-wrap">
        {comparisonResult?.compare && (
          <section className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Comparison Result</h3>
            <ul className="text-sm">
              {Object.entries(comparisonResult.compare).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </section>
        )}

        {comparisonResult?.correlation && (
          <section className="mt-6 p-4 rounded">
            <h3 className="text-lg font-semibold">Correlation Result</h3>
            <table className="text-sm table-auto w-full">
              <tbody>
                {Object.entries(comparisonResult.correlation).map(
                  ([key, value]) => (
                    <tr key={key} className="border-2 border-gray-300">
                      <th className="text-left bg-gray-100 py-1 px-2 border-r-gray-300 border-r-2">
                        {key}:
                      </th>
                      <td className="px-2">{value}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </section>
        )}

        {plotresult?.plot1 && (
          <section className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Generated Plot</h3>
            <img
              src={plotresult.plot1}
              alt="Generated Plot"
              className="w-full h-auto"
            />
          </section>
        )}
        {plotresult?.plot2 && (
          <section className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Generated Plot</h3>
            <img
              src={plotresult.plot2}
              alt="Generated Plot"
              className="w-full h-auto"
            />
          </section>
        )}
      </section>

      <section className="flex flex-row items-center justify-center w-full">
        {image && !encryptedImageUrl && (
          <button
            onClick={handleEncryptImage}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded w-48 h-10 mt-10 mr-10"
            disabled={loading}
          >
            {loading ? "Encrypting..." : "Encrypt"}
          </button>
        )}

        {image && encryptedImageUrl && decryptedImageUrl && (
          <button
            onClick={handleCompareImages}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded w-48 h-10 mt-10 mr-10"
            disabled={selectedImages.length !== 2 || loading}
          >
            {loading ? "Comparing..." : "Compare Images"}
          </button>
        )}
        {image && encryptedImageUrl && decryptedImageUrl && (
          <button
            onClick={handlePlotImage}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded w-48 h-10 mt-10 mr-10"
            disabled={selectedImages.length !== 2 || ploting}
          >
            {loading ? "Ploting..." : "Plot"}
          </button>
        )}

        {image && encryptedImageUrl && decryptedImageUrl && (
          <button
            onClick={handleRemoveSelection}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded w-48 h-10 mt-10 mr-10"
            disabled={selectedImages.length !== 2 || loading}
          >
            Remove Selection
          </button>
        )}

        {encryptedImageUrl && !decryptedImageUrl && (
          <button
            onClick={handleDecryptImage}
            className="bg-green-500 hover:bg-green-600 text-white rounded w-48 h-10 mt-10 mr-10"
            disabled={loading}
          >
            {loading ? "Decrypting..." : "Decrypt"}
          </button>
        )}

        {(image || encryptedImageUrl || decryptedImageUrl) && (
          <button
            onClick={handleRemoveAll}
            className="bg-red-500 hover:bg-red-600 text-white rounded w-48 h-10 mt-10"
          >
            Remove All
          </button>
        )}
      </section>
    </main>
  );
}
