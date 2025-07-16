import BestSellers from "@/components/Best-Sellers/BestSellers";
import Bottoms from "@/components/Bottoms/Bottoms";
import Dresses from "@/components/Dresses/Dresses";
import Hero from "@/components/Hero/Hero";
import Sets from "@/components/Sets/Sets";
import Tops from "@/components/Tops-Shirts/Tops-Shirts";
export default async function Home() {
  return (
    <>
      <Hero />
      <BestSellers />
      <Sets />
      <Tops />
      <Dresses />
      <Bottoms />
    </>
  );
}
