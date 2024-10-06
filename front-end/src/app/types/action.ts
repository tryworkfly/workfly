type Step = {
    name: string;
    description: string;
    inputs: StepInput[];
    isDefault?: boolean;
}

type StepInput = {
    name: string;
    description: string;
    type: string;
    required: boolean;
}