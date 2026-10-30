import type { WorkflowRequest } from "../../types";
export interface WorkflowFormProps {
  request: WorkflowRequest;
  onClose: () => void;
  onBusy: (busy: boolean) => void;
  onChanged: () => void;
}