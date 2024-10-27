import { XYPosition } from "@xyflow/react";

export type Workflow = {
  id?: string;
  name: string;
  run_name?: string;
  trigger: Trigger[];
  jobs: Job[];
  job_edges: [string, string][]; // source to target
};

export type Trigger = {
  event: string; // push, pull_request, etc.
  config: Record<string, any>;
};

export type Job = {
  id: string;
  name: string;
  steps: Step[];
};

export type Step = {
  id: string;
  name: string;
  position: XYPosition;
  inputs: Record<string, any>;
  step_id: string;
};
