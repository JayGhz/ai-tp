"use client";

import { motion } from "motion/react";

export function AnimatedLine({ children }: { children: React.ReactNode }) {
  const strokeDashValue = 1000;

  return (
    <motion.g
      initial={{ strokeDashoffset: strokeDashValue }}
      animate={{ strokeDashoffset: 0 }}
      transition={{
        strokeDashoffset: { type: "spring", duration: 5.5, bounce: 0 },
      }}
      style={{ strokeDasharray: strokeDashValue }}
    >
      {children}
    </motion.g>
  );
}
