export function apiClient(url: string, options?: RequestInit) {
  return fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  }).then(async (res) => {
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message ?? "Request failed.");
    }

    return data;
  });
}
