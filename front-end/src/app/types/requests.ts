type WorkflowRequest = {
  name: string;
  runName: string;
  trigger: TriggerRequest[];
  jobs: JobRequest[];
  jobEdges: [string, string][]; // source to target
};

type TriggerRequest = {
  event: string; // push, pull_request, etc.
  config: Record<string, any>;
};

type JobRequest = {
  name: string,
  steps: StepRequest[]
};

type StepRequest = {
  name: string;
  inputs: Record<string, any>;
  id: string;
};
