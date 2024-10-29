import { XYPosition } from "@xyflow/react";

export type Edge = {
  id: string;
  source: string;
  target: string;
};

export type Workflow = {
  id?: string;
  name: string;
  run_name?: string;
  trigger: Trigger;
  jobs: Job[];
  job_edges: Edge[];
};

export type Trigger = {
  id: string;
  position: XYPosition;
  conditions: TriggerCondition[];
};

export type TriggerCondition = {
  event: string; // push, pull_request, etc.
  config: Record<string, any>;
};

export type Job = {
  id: string;
  name: string;
  steps: Step[];
  step_edges: Edge[];
};

export type Step = {
  id: string;
  name: string;
  position: XYPosition;
  inputs: Record<string, any>;
  step_id: string;
};
