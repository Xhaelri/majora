"use client";
import { motion } from "framer-motion";
// import CarouselWithPagination from "./Carousel";
import Hero2 from "./Hero2";

function Hero() {
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 100 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="relativ"
    >
      {/* <CarouselWithPagination /> */}
      <Hero2/>
    </motion.section>
  );
}

export default Hero;
