"use client";
import { motion } from "framer-motion";
import CarouselWithPagination from "./Carousel";

function Hero() {
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 100 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="relativ"
    >
      <CarouselWithPagination />
    </motion.section>
  );
}

export default Hero;
