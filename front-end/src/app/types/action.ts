type Step = {
  name: string;
  id: string;
  version: string;
  category: string;
  description: string;
  inputs: StepInput[];
  required_permissions: Record<string, string>[];
};

type StepInput = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  value?: string | boolean | number;
};