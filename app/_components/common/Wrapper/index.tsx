import { MotionSystem } from "../MotionSystem";
import { WorkflowProvider } from "../Workflow";
import { MealDialogProvider } from "../MealDialog";
import type { WrapperProps } from "./types";

export function Wrapper({ children }: WrapperProps) {
  return (
    <MotionSystem><WorkflowProvider><MealDialogProvider><div className="flex min-h-dvh min-w-0 flex-1 flex-col">
      {children}
    </div></MealDialogProvider></WorkflowProvider></MotionSystem>
  );
}
