import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/loading";

type ChefOnboardingValues = {
  phone: string;
  address: string;
  bio: string;
};

type ProfileData = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
};

export default function BecomeChefPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  // 1. Fetch current profile configuration details
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient("/api/users/profile") as Promise<ProfileData>,
    enabled: status === "authenticated",
  });

  // 2. React Hook Form implementation using native config setups
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChefOnboardingValues>({
    defaultValues: {
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      bio: profile?.bio ?? "",
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      bio: profile.bio ?? "",
    });
  }, [profile, reset]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  // 3. API Mutation configuration execution
  const onboardingMutation = useMutation({
    mutationFn: (values: ChefOnboardingValues) => {
      return apiClient("/api/users/become-a-chef", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    },
  });

  function onSubmit(values: ChefOnboardingValues) {
    onboardingMutation.mutate(values);
  }

  // 4. Session and authentication step-out routing
  if (status === "loading" || isProfileLoading) {
    return (
      <Loading label="Loading chef onboarding..." fullScreen />
    );
  }

  if (profile && profile.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You are already registered as a {profile.role}. This onboarding is only for customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/profile")}>Back to Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-4xl text-secondary">Become a Chef</CardTitle>
          <CardDescription>
            Complete your profile details below to send your chef application for verification.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="become-a-chef-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                {...register("phone", {
                  required: "Phone number is required",
                  minLength: { value: 6, message: "Phone number must be at least 6 characters" },
                })}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Kitchen Address</Label>
              <Input
                id="address"
                placeholder="123 Culinary Ave, Suite 100"
                {...register("address", {
                  required: "Address is required",
                  minLength: { value: 10, message: "Please enter a full, valid address" },
                })}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Chef Biography</Label>
              <Textarea
                id="bio"
                rows={5}
                placeholder="Tell customers about your culinary background, specialty cuisines..."
                {...register("bio", {
                  required: "A brief bio is required",
                  minLength: { value: 20, message: "Bio must be at least 20 characters long" },
                })}
              />
              {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
            </div>

            {onboardingMutation.isError && (
              <p className="text-sm text-red-500">An error occurred while submitting. Please try again.</p>
            )}
          </form>
        </CardContent>

        <CardFooter className="justify-start gap-2">
          <Button variant="outline" asChild>
            <Link href="/profile">Cancel</Link>
          </Button>
          <Button type="submit" form="become-a-chef-form" disabled={onboardingMutation.isPending}>
            {onboardingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
