import Prng from "@/components/Prng";
export default function Home() {
  return (
    <main className="w-full flex-col items-center justify-between p-12">
      <h1 className="text-9xl font-bold">Pseudo Random Number Generator</h1>
      <Prng />
    </main>
  );
}
