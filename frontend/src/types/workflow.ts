type Workflow = {
  id?: string;
  name: string;
  run_name?: string;
  trigger: Trigger[];
  jobs: Job[];
  job_edges: [string, string][]; // source to target
};

type Trigger = {
  event: string; // push, pull_request, etc.
  config: Record<string, any>;
};

type Job = {
  name: string;
  steps: Step[];
};

type Step = {
  name: string;
  inputs: Record<string, any>;
  step_id: string;
};
