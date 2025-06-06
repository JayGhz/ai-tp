"use client";

import { motion } from "motion/react";

export function AnimatedArea({ children }: { children: React.ReactNode }) {
  return (
    <motion.g
      initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{
        duration: 1.2,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.g>
  );
}
