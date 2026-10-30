import { CoffeeIcon, ForkKnifeIcon, CookieIcon, MoonIcon, CakeIcon } from "@phosphor-icons/react/dist/ssr";
import type { MealTypeIconProps } from "./types";

const icons = { BREAKFAST: CoffeeIcon, LUNCH: ForkKnifeIcon, SNACK: CookieIcon, DINNER: MoonIcon, DESSERT: CakeIcon };

export function MealTypeIcon({ type, size = 16, className = "shrink-0" }: MealTypeIconProps) {
  const Icon = icons[type] ?? ForkKnifeIcon;
  return <Icon size={size} aria-hidden="true" className={className} />;
}