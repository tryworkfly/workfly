const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const fetcher = <T>(path: string, init?: RequestInit) =>
  fetch(`${baseUrl}${path}`, init).then((res) => res.json() as T);

export default fetcher;
