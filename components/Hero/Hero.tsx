"use client";

import { motion } from "framer-motion";
import React from "react";

function Hero({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }} 
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="relative" 
    >
      {children}
    </motion.section>
  );
}

export default Hero;