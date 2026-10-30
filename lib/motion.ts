import type { Transition } from "framer-motion";

export function motionTransition(): Transition {
  let duration = 0.18;
  if (typeof document !== "undefined") {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--duration-normal").trim();
    if (token) duration = token.endsWith("ms") ? parseFloat(token) / 1000 : parseFloat(token);
  }
  return { duration: Number.isFinite(duration) ? duration : 0.18, ease: [0.2, 0, 0, 1] };
}