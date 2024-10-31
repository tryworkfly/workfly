type Export = {
  id?: string;
  state: string;
  result?: string;
  workflow_id: string;
};

type ExportRequest = {
  workflow_id: string;
};
