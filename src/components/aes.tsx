"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ImagePreviewSection from "./ImageRow";
import PrintButton from "./printbutton";

type ImageFile = File | null;

export default function AES() {
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
  const [ImageWidth, setImageWidth] = useState<number | null>(null);
  const [ImageHeight, setHeight] = useState<number | null>(null);
  const [decryptedImageSize, setDecryptedImageSize] = useState<number | null>(
    null,
  );
  const [byteSize, setByteSize] = useState<number | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | undefined>(
    undefined,
  );
  const [ivector, setIV] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<Record<
    string,
    string
  > | null>(null);
  const [multiResult, setMultiResult] = useState<Record<string, string> | null>(
    null,
  );
  const [plotresult, setPlotResult] = useState<Record<string, string> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [ploting, setPloting] = useState(false);
  const [multing, setMulting] = useState(false);

  const BASE_URL = "http://152.42.156.81";
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  useEffect(() => {
    // Define the asynchronous function inside useEffect
    const fetchEncryptionKey = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/generate-key`);
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

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/tiff")
    ) {
      setImage(file);
      setUploadedImageUrl(URL.createObjectURL(file)); // Generate and store the URL once
    } else {
      alert("Please upload a valid image file (jpg, jpeg, or png).");
    }
  };

  const handleEncryptImage = async () => {
    if (!image) return alert("Please upload an image first.");

    setLoading(true);
    try {
      const formData = new FormData();
      if (image && encryptionKey) {
        formData.append("image", image);
        formData.append("key", encryptionKey);
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
      setImageWidth(parseInt(Width));
      setHeight(parseInt(Height));
      setByteSize(parseInt(byteSize));

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
      formData.append("type", "notrsa");

      const response = await axios.post(`${BASE_URL}/decrypt-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Width": ImageWidth,
          "X-Height": ImageHeight,
          "X-Datalength": byteSize,
        },
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

  const handleCompareImages = async () => {
    setLoading(true);
    try {
      console.log("THis shit");
      if (typeof uploadedImageUrl !== "string" || !uploadedImageUrl) {
        throw new Error("uploadedImageUrl must be a valid string");
      }
      if (typeof encryptedImageUrl !== "string" || !encryptedImageUrl) {
        throw new Error("encryptedImageUrl must be a valid string");
      }
      if (typeof decryptedImageUrl !== "string" || !decryptedImageUrl) {
        throw new Error("decryptedImageUrl must be a valid string");
      }
      if (!ivector || !encryptionKey) {
        throw new Error("Missing IV");
      }
      // Fetch the selected images as blobs
      const originalBlob = await fetch(uploadedImageUrl).then((res) =>
        res.blob(),
      );
      const encryptedBlob = await fetch(encryptedImageUrl).then((res) =>
        res.blob(),
      );
      const decryptedBlob = await fetch(decryptedImageUrl).then((res) =>
        res.blob(),
      );
      const formDataCompare = new FormData();
      formDataCompare.append("original", originalBlob, "original_image.png");
      formDataCompare.append("cipher", encryptedBlob, "decrypted_image.png");
      formDataCompare.append("iv", ivector);
      formDataCompare.append("key", encryptionKey);
      const formDataEnt = new FormData();
      formDataEnt.append("original", originalBlob, "original_image.png");
      formDataEnt.append("cipher", encryptedBlob, "encrypted_image.png");
      formDataEnt.append("decrypted", decryptedBlob, "decrypted_image.png");
      const formLossEnt = new FormData();
      formLossEnt.append("original", originalBlob, "original_image.png");
      formLossEnt.append("decrypted", decryptedBlob, "decrypted_image.png");

      // Send requests to both endpoints concurrently
      const [
        compareResponse,
        corrResponse,
        entResponse,
        formulaResponse,
        histResponse,
        dataResponse,
      ] = await Promise.all([
        axios.post(`${BASE_URL}/compare-images`, formDataCompare, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        axios.post(`${BASE_URL}/corr-calc`, formDataEnt, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        axios.post(`${BASE_URL}/corr-entropy`, formDataEnt, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        axios.post(`${BASE_URL}/formulas`, formDataCompare, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        axios.post(`${BASE_URL}/calculate_variance`, formDataCompare, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        axios.post(`${BASE_URL}/data_loss`, formLossEnt, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      ]);
      console.log(compareResponse.data);
      console.log(corrResponse.data);
      console.log(entResponse.data);
      console.log(formulaResponse.data);
      console.log(histResponse.data);
      console.log(dataResponse.data);
      // Update state with responses
      setComparisonResult({
        compare: compareResponse.data,
        correlationci: corrResponse.data.cipher,
        correlationog: corrResponse.data.original,
        correlationde: corrResponse.data.decrypted,
        entropy: entResponse.data,
        formula: formulaResponse.data,
        hist: histResponse.data,
      });
      if (comparisonResult)
        console.log(
          "Here",
          comparisonResult.correlationci,
          comparisonResult.correlationog,
        );
    } catch (error) {
      console.error("Error during comparison and correlation:", error);
      alert(
        "An error occurred during image comparison or correlation. Check console for details.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleMutliStuff = async () => {
    setMulting(true);
    try {
      console.log("THis shit");
      if (typeof uploadedImageUrl !== "string" || !uploadedImageUrl) {
        throw new Error("uploadedImageUrl must be a valid string");
      }
      const originalBlob = await fetch(uploadedImageUrl).then((res) =>
        res.blob(),
      );
      // Create FormData for both requests
      const formDataCompare = new FormData();
      formDataCompare.append("original", originalBlob, "original_image.png");

      // Send requests to both endpoints concurrently
      const [multiResponse] = await Promise.all([
        axios.post(`${BASE_URL}/multimage-corr`, formDataCompare, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      ]);
      console.log(multiResponse);
      // Update state with responses
      setMultiResult({
        multi: multiResponse.data,
      });
    } catch (error) {
      console.error("Error during comparison and correlation:", error);
      alert(
        "An error occurred during image comparison or correlation. Check console for details.",
      );
    } finally {
      setMulting(false);
    }
  };

  const handlePlotImage = async () => {
    setPloting(true);

    try {
      if (typeof uploadedImageUrl !== "string" || !uploadedImageUrl) {
        throw new Error("uploadedImageUrl must be a valid string");
      }
      if (typeof encryptedImageUrl !== "string" || !encryptedImageUrl) {
        throw new Error("encryptedImageUrl must be a valid string");
      }
      const originalBlob = await fetch(uploadedImageUrl).then((res) =>
        res.blob(),
      );
      const encryptedBlob = await fetch(encryptedImageUrl).then((res) =>
        res.blob(),
      );

      // Fetch the selected images as blobs
      const formDataPlot = new FormData();
      formDataPlot.append("original", originalBlob, "original_image.png");
      formDataPlot.append("cipher", encryptedBlob, "encrypted_image.png");
      const [plotResponse11,plotResponse12, plotResponse2] = await Promise.all([
        axios.post(`${BASE_URL}/plot/original`, formDataPlot, {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }),
        axios.post(`${BASE_URL}/plot/encrypted`, formDataPlot, {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }),
        axios.post(`${BASE_URL}/plot1`, formDataPlot, {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }),
      ]);
      console.log(plotResponse11.data);
      console.log(plotResponse12.data);
      console.log(plotResponse2.data);
      const plotUrl11 = URL.createObjectURL(plotResponse11.data);
      const plotUrl12 = URL.createObjectURL(plotResponse12.data);
      const plotUrl2 = URL.createObjectURL(plotResponse2.data);
      console.log(plotUrl11,plotUrl12)
      setPlotResult({
        plot11: plotUrl11,
        plot12 : plotUrl12,
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
    setComparisonResult(null);
    setPlotResult(null);
    setMultiResult(null);
    setIV(null);
    setByteSize(null);
    setHeight(null);
    setImageWidth(null);
  };

  return (
    <main className="w-full flex flex-col justify-center items-center pt-5">
      {/* Upload Image */}
      {image || encryptedImageUrl ? (
        <p></p>
      ) : encryptionKey ? (
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
      ) : (
        <p>Setting Up your Key ...</p>
      )}

      <ImagePreviewSection
        uploadedImageUrl={uploadedImageUrl}
        encryptedImageUrl={encryptedImageUrl}
        decryptedImageUrl={decryptedImageUrl}
        encryptionKey={encryptionKey}
      />
      <section className="flex flex-col justify-center w-full">
        {comparisonResult?.compare && (
          <section className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Comparison Result</h3>
            <ul className="text-sm">
              {Object.entries(comparisonResult.compare).map(([key, value]) => (
                <li key={key}>
                  {key != "mismatch" ? (
                    <>
                      {" "}
                      <strong>{key}:</strong> {value}
                    </>
                  ) : (
                    <p></p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {comparisonResult && (
          <section className="flex flex-col w-full items-center justify-center my-5">
            <table className="table-auto border-collapse border border-slate-400 text-center mt-1">
              <thead>
                <tr>
                  <th className="border border-slate-400 p-2">Image</th>
                  <th className="border border-slate-400 p-2">
                    Diagonal Correlation
                  </th>
                  <th className="border border-slate-400 p-2">
                    Horizontal Correlation
                  </th>
                  <th className="border border-slate-400 p-2">
                    Vertical Correlation
                  </th>
                  <th className="border border-slate-400 p-2">Histogram</th>
                  <th className="border border-slate-400 p-2">Entropy</th>
                  <th className="border border-slate-400 p-2">
                    Correlation Coefficient
                    <br />
                    <span className="text-xs">Original vs Cipher</span>
                  </th>
                  <th className="border border-slate-400 p-2">
                    Correlation Coefficient
                    <br />
                    <span className="text-xs">Original vs Decrypted</span>
                  </th>
                  <th className="border border-slate-400 p-2">
                    Correlation Coefficient
                    <br />
                    <span className="text-xs">Cipher vs Decrypted</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 p-2">
                    Original Image
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationog.dcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationog.hcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationog.vcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.hist.histogram_original}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.e_plain}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.cc_plainvcipher}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.cc_plainvsdecrypt}
                  </td>
                  <td className="border border-slate-400 p-2">-</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2">
                    Encrypted Image
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationci.dcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationci.hcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationci.vcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    <div>{comparisonResult.hist.histogram_cipher}</div>
                    <div className="text-xs text-gray-500">
                      Variance Reduction:{" "}
                      {comparisonResult.hist.variance_reduction}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.e_cipher}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.cc_plainvcipher}
                  </td>
                  <td className="border border-slate-400 p-2">-</td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.cc_ciphervsdecrypt}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-2">
                    Decrypted Image
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationde.dcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationde.hcorr}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.correlationde.vcorr}
                  </td>
                  <td className="border border-slate-400 p-2"> </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.e_decrypted}
                  </td>
                  <td className="border border-slate-400 p-2">-</td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.cc_plainvsdecrypt}
                  </td>
                  <td className="border border-slate-400 p-2">
                    {comparisonResult.entropy.cc_ciphervsdecrypt}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
        {multiResult?.multi && (
          <section className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">
              Multi-Image Analysis Results
            </h3>

            {/* Cipher Details Table */}
            {multiResult.multi?.cipher_details && (
              <div className="mt-4">
                <h4 className="text-md font-semibold">Cipher Details</h4>
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Pair</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Correlation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiResult.multi.cipher_details.map(
                      ({ pair, correlation }) => (
                        <tr key={pair}>
                          <td className="border border-gray-300 px-4 py-2">
                            {pair}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {correlation}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Key Details Table */}
            {multiResult.multi?.key_details && (
              <div className="mt-6">
                <h4 className="text-md font-semibold">Key Details</h4>
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">
                        File Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiResult.multi.key_details.map(({ file_name, key }) => (
                      <tr key={file_name}>
                        <td className="border border-gray-300 px-4 py-2">
                          {file_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {key}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

{plotresult?.plot11 && (
  <section className="p-4 bg-gray-100 rounded mt-10 flex items-center justify-center space-x-5">
    <img
      src={uploadedImageUrl}
      alt="Encrypted Image Plot"
      className="w-96 h-96"
    />    
    <img
      src={plotresult.plot11}
      alt="Encrypted Image Plot"
      className="w-96 h-96"
    />
  </section>
)}
{plotresult?.plot11 && (
  <section className="mt-10 p-4 bg-gray-100 rounded flex items-center justify-center space-x-5">
      <img
      src={encryptedImageUrl}
      alt="Encrypted Image Plot"
      className="w-96 h-96"
    />   
    <img
      src={plotresult.plot12}
      alt="Encrypted Image Plot"
      className="w-96 h-96"
    />
  </section>
)}
{plotresult?.plot2 && (
  <section className="mt-6 p-4 bg-gray-100 rounded">
    <h3 className="text-lg font-semibold">Comparison Plot</h3>
    <img
      src={plotresult.plot2}
      alt="Comparison Plot"
      className="max-w-full h-auto"
    />
  </section>
)}
      </section>
      <section className="flex flex-row items-center justify-center">
        {comparisonResult?.correlationog && comparisonResult?.correlationci && (
          <section className="mt-6 p-4 rounded">
            <h3 className="text-lg font-semibold">
              Correlation Result Original
            </h3>
            <table className="text-sm table-auto w-full mt-1">
              <tbody>
                {Object.entries(comparisonResult.correlationog).map(
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
            <h3 className="text-lg font-semibold mt-2">
              Correlation Result Cipher
            </h3>
            <table className="text-sm table-auto w-full mt-1">
              <tbody>
                {Object.entries(comparisonResult.correlationci).map(
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
            <h3 className="text-lg font-semibold mt-2">
              Correlation Result Decrypted
            </h3>
            <table className="text-sm table-auto w-full mt-1">
              <tbody>
                {Object.entries(comparisonResult.correlationde).map(
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
        {comparisonResult?.entropy && (
          <section className="mt-6 p-4 rounded">
            <h3 className="text-lg font-semibold">Entropy</h3>
            <table className="text-sm table-auto w-full">
              <tbody>
                {Object.entries(comparisonResult.entropy).map(
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
        {comparisonResult?.formula && (
          <section className="mt-6 p-4 rounded">
            <h3 className="text-lg font-semibold">Formula</h3>
            <table className="text-sm table-auto w-full">
              <tbody>
                {Object.entries(comparisonResult.formula).map(
                  ([key, value]) => (
                    <tr key={key} className="border-2 border-gray-300">
                      <th className="text-left bg-gray-100 py-1 px-2 border-r-gray-300 border-r-2">
                        {key}:
                      </th>
                      <td className="px-2">{parseFloat(value).toFixed(2)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
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
          >
            {loading ? "Comparing..." : "Compare Images"}
          </button>
        )}
        {image && encryptedImageUrl && decryptedImageUrl && (
          <button
            onClick={handlePlotImage}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded w-48 h-10 mt-10 mr-10"
          >
            {ploting ? "Ploting..." : "Plot"}
          </button>
        )}
        {image && encryptedImageUrl && decryptedImageUrl && (
          <button
            onClick={handleMutliStuff}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded w-48 h-10 mt-10 mr-10"
          >
            {multing ? "Waiting..." : "Multi"}
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
          <section className="flex flex-row items-center justify-center">
            <button
              onClick={handleRemoveAll}
              className="bg-red-500 hover:bg-red-600 text-white rounded w-48 h-10 mt-10"
            >
              Remove All
            </button>
            <PrintButton
              label="Print Document"
              onBeforePrint={() => {}}
              onAfterPrint={() => {}}
              className=""
            />
          </section>
        )}
      </section>
    </main>
  );
}
