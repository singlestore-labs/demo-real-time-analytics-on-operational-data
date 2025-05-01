import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { DBSection } from "@/db/components/section";
import { WSProvider } from "@/ws/components/provider";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <WSProvider>
        <Header />

        <main className="relative grid [grid-template-columns:repeat(auto-fit,_minmax(24rem,_1fr))] gap-x-4 gap-y-8 px-4 max-lg:flex-col">
          <DBSection db="singlestore" />
          <DBSection db="mysql" />
          <DBSection db="postgres" />
        </main>

        <Footer className="mt-8" />
      </WSProvider>
    </>
  );
}
