import BestSellers from "@/components/Best_Sellers/BestSellers";
import Bottoms from "@/components/Bottoms/Bottoms";
import Dresses from "@/components/Dresses/Dresses";
import Hero from "@/components/Hero/Hero";
import Kimonos from "@/components/Kimonos-Kaftans/Kimonos-Kaftans";
import Tops from "@/components/Tops-Shirts/Tops-Shirts";
export default async function Home() {

  return (
    <>
      <Hero />
      <BestSellers />
      <Tops/>
      <Kimonos/>
      <Dresses/>
      <Bottoms/>
    </>
  );
}
