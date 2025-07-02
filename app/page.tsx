import BestSellers from "@/components/Best_Sellers/BestSellers";
import Hero from "@/components/Hero/Hero";
export default async function Home() {
  // const session = await auth();
  // if (!session) redirect("/signin");
  return (
    <>
      <Hero />
      <BestSellers />
    </>
  );
}
