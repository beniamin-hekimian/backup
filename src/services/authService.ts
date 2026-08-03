import { apiClient } from "@/lib/apiClient";

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
