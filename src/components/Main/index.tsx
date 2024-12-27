import NavBar from "../NavBar";
import Prng from "@/components/Prng";
export default function Home() {
	return (
		<main className="w-full flex-col items-center font-serif justify-center px-48 py-5">
			<NavBar />
			<Prng />
		</main>
	);
}
