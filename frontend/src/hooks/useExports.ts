import fetcher from "@/lib/fetcher";
import useSWR from "swr";

export function useExport(id?: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Export>(
    id ? `/exports/${id}` : null,
    fetcher
  );

  return {
    workflowExport: data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
