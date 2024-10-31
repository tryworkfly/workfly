export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const fetcher = <T>(path: string, init?: RequestInit) =>
  fetch(`${apiUrl}${path}`, init).then((res) => res.json() as T);

export default fetcher;
