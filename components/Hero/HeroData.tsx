import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeroDataProps {
  button: string;
  title: string;
  desc?: string;
  variant?: string;
}

function HeroData({ button, title, desc, variant }: HeroDataProps) {
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  // Child element animation variants
  const childVariants = {
    hidden: {
      y: 50,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const buttonVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.7, 
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(" absolute z-10 p-4 text-secondary ", {
        "flex flex-col items-center justify-center inset-0": variant === "center",
        "left-0 bottom-10": !variant,
      })}
    >
      <div className="relative">
        <div className=" w-20 h-0  rounded-full shadow-[0_0_160px_80px_rgba(0,0,0,0.7)] absolute inset-0 mx-auto my-auto -z-10"></div>
        <motion.h1
          variants={childVariants}
          className="text-5xl  md:text-7xl font-extralight mb-2 relative"
        >
          {title}
        </motion.h1>
      </div>
      {desc && (
        <motion.p variants={childVariants} className="text-xl md:text-2xl mb-6">
          {desc}
        </motion.p>
      )}

      <motion.div variants={buttonVariants}>
        <Button
          variant="hero"
          size="hero"
          className="tracking-widest text-md cursor-pointer"
        >
          {button}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default HeroData;
