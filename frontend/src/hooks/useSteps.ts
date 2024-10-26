import fetcher from "@/lib/fetcher";
import useSWR from "swr";

function useStepDefinitions() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<StepDefinition[]>(
    "/step_definitions",
    fetcher
  );
  return {
    stepDefinitions: data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export default useStepDefinitions;
