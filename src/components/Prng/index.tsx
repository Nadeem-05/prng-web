"use client";

import { useState, ChangeEvent } from "react";
import AES from "../aes";
import RSAES from "../rsaes";

export default function Home() {
  const [selectedComponent, setSelectedComponent] = useState<
    "AES" | "RSAES" | ""
  >("");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "AES" | "RSAES" | "";
    setSelectedComponent(value);

    if (value === "") {
      alert("Select Encryption Type");
    }
  };

  return (
    <main className="w-full flex flex-col justify-center items-center pt-5">
      {/* Dropdown to select the component */}
      <section className="flex flex-col w-full mb-5">
        <label htmlFor="component-select" className="mr-2">
          Select Component:
        </label>
        <select
          id="component-select"
          className="w-1/2 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 "
          value={selectedComponent}
          onChange={handleChange}
        >
          <option value="">Select Encryption Type</option>
          <option value="AES">AES</option>
          <option value="RSAES">AES with RSA Key Encryption</option>
        </select>
      </section>

      {/* Conditional rendering based on the selected component */}
      {selectedComponent === "AES" && <AES />}
      {selectedComponent === "RSAES" && <RSAES />}
    </main>
  );
}
