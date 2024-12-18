import Prng from "@/components/Prng";
export default function Home() {
  return (
    <main className="w-full flex-col items-center font-serif justify-center px-12 py-5">
      <h1 className="text-2xl font-bold ">Pseudo Random Number Generator</h1>
      <Prng />
    </main>
  );
}
