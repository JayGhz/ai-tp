"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export function AnimatedBarVertical({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      style={{
        transformOrigin: "bottom",
        pointerEvents: "none",
        ...style,
      }}
      className="absolute inset-0"
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: index * 0.075,
      }}
    >
      {children}
    </motion.div>
  );
}
