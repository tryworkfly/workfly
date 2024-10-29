import { createContext, useContext, useState } from "react";

type StringOrUndefinedState = ReturnType<typeof useState<string | undefined>>;

const WorkflowIdContext = createContext<StringOrUndefinedState | undefined>(
  undefined
);

export function WorkflowIdContextProvider({
  children,
  value,
}: {
  children: React.ReactNode | React.ReactNode[];
  value: StringOrUndefinedState;
}) {
  return (
    <WorkflowIdContext.Provider value={value}>
      {children}
    </WorkflowIdContext.Provider>
  );
}

export function useWorkflowId() {
  const val = useContext(WorkflowIdContext);
  if (!val)
    throw new Error(
      "useWorkflowId hook must be used as a child of the WorkflowIdContextProvider component!"
    );
  return val;
}
