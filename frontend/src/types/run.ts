type Run = {
  id?: string;
  state: string;
  result?: string;
  workflow_id: string;
};

type RunRequest = {
  workflow_id: string;
};
