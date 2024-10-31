type ExportState = "RUNNING" | "SUCCEEDED" | "FAILED";

type Export = {
  id?: string;
  state: ExportState;
  result?: string;
  workflow_id: string;
};

type ExportRequest = {
  workflow_id: string;
};
