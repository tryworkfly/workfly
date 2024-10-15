import fetcher from "@/lib/fetcher";
import useSWR from "swr";

function useSteps() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Step[]>(
    "/steps",
    fetcher
  );
  return {
    steps: data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export default useSteps;
