import Prng from "@/components/Prng";
export default function Home() {
  return (
    <main className="w-full flex-col items-center font-serif justify-center px-48 py-5">
      <section className="flex flex-row w-full justify-between">
        <h1 className="text-2xl font-bold ">Pseudo Random Number Generator</h1>
        <h1 className="text-2xl font-bold ">##?/%</h1>
      </section>
      <Prng />
    </main>
  );
}
