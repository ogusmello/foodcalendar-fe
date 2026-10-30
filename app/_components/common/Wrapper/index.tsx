import { MealDialogProvider } from "../MealDialog";
import type { WrapperProps } from "./types";

export function Wrapper({ children }: WrapperProps) {
  return (
    <MealDialogProvider><div className="flex min-h-dvh min-w-0 flex-1 flex-col">
      {children}
    </div></MealDialogProvider>
  );
}
