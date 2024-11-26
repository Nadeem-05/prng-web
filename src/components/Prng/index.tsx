"use client";

import { useState } from "react";

type ImageFile = File | null;

export default function Home() {
  const [image, setImage] = useState<ImageFile>(null);

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

  const handleRemoveImage = () => {
    setImage(null);
  };

  return (
    <main className="w-full flex flex-col justify-between pt-5">
      {image ? (
        <section className="flex flex-col">
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded Preview"
            className=" w-72 h-72 object-cover rounded mb-4"
          />
          <p className="text-sm text-gray-600">File Name: {image.name}</p>
          <p className="text-sm text-gray-600">
            File Size: {(image.size / 1024).toFixed(2)} KB
          </p>
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
    </main>
  );
}
