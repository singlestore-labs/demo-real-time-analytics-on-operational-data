import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WSProvider } from "@/ws/components/provider";

export const dynamic = "force-dynamic";

export default function Dev() {
  return (
    <>
      <WSProvider>
        <Header />

        <main className="relative container mx-auto flex flex-1 flex-wrap items-stretch gap-8 px-4 max-lg:flex-col"></main>

        <Footer className="mt-8" />
      </WSProvider>
    </>
  );
}
