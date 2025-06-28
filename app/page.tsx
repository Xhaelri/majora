import { auth } from "@/auth";
import BestSellers from "@/components/Best_Sellers/BestSellers";
import Hero from "@/components/Hero/Hero";
import { redirect } from "next/navigation";
export default async function Home() {
  const session = await auth();
  if (!session) redirect("/signin");
  return (
    <>
      <Hero />
      <BestSellers />
    </>
  );
}
