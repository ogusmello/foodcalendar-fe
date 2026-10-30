"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedSurfaceProps } from "./types";

export function AnimatedSurface({ children, identity, className }: AnimatedSurfaceProps) {
  const reduce = useReducedMotion();
  return <motion.div key={identity} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={className}>{children}</motion.div>;
}