import fetcher from "@/lib/fetcher";
import useSWR from "swr";

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
