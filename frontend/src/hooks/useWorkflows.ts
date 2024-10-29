import fetcher from "@/lib/fetcher";
import { Workflow } from "@/types/workflow";
import useSWR from "swr";
import { useWorkflowId } from "./useWorkflowId";

export function useWorkflow(id?: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Workflow>(
    id ? `/workflows/${id}` : null,
    fetcher
  );

  return {
    workflow: data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function useCurrentWorkflow() {
  const [id] = useWorkflowId();
  return useWorkflow(id);
}
