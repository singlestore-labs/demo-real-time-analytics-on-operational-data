import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { DBSection } from "@/db/components/section";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Header />

      <main className="relative container mx-auto flex flex-1 flex-wrap items-stretch gap-8 px-4 max-lg:flex-col">
        <DBSection
          className="flex-1"
          db="singlestore"
        />

        <Separator
          className="absolute top-0 left-1/2 -translate-x-1/2 max-lg:hidden"
          orientation="vertical"
        />

        <DBSection
          className="flex-1"
          db="postgres"
        />
      </main>

      <Footer className="mt-8" />
    </>
  );
}
