import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();

  const {
    mutate: register,
    isPending: isRegistering,
    error: registerError,
  } = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      await authService.register(data);

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      toast.success("Signed up successfully");
      router.push("/");
    },
  });

  const {
    mutate: login,
    isPending: isLoggingIn,
    error: loginError,
  } = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      router.push("/");
    },
  });

  return {
    register,
    isRegistering,
    registerError,
    login,
    isLoggingIn,
    loginError,
  };
}
