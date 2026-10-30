"use client";

import { MotionConfig } from "framer-motion";
import { motionTransition } from "@/lib/motion";
import type { MotionSystemProps } from "./types";

export function MotionSystem({ children }: MotionSystemProps) {
  return <MotionConfig reducedMotion="user" transition={motionTransition()}>{children}</MotionConfig>;
}