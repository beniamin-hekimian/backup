import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/loading";

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

type EditProfileFormValues = {
  name: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  avatar: string;
  bio: string;
  phone: string;
  address: string;
};

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status, update } = useSession();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    defaultValues: {
      name: "",
      email: "",
      newPassword: "",
      confirmPassword: "",
      avatar: "",
      bio: "",
      phone: "",
      address: "",
    },
  });

  const newPasswordValue = useWatch({ control, name: "newPassword" });
  const avatarPreview = useWatch({ control, name: "avatar" });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient("/api/users/profile") as Promise<ProfileData>,
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    reset({
      name: profileQuery.data.name,
      email: profileQuery.data.email,
      newPassword: "",
      confirmPassword: "",
      avatar: profileQuery.data.avatar ?? "",
      bio: profileQuery.data.bio ?? "",
      phone: profileQuery.data.phone ?? "",
      address: profileQuery.data.address ?? "",
    });
  }, [profileQuery.data, reset]);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(new Error("Could not read selected image file."));
        reader.readAsDataURL(file);
      });

      if (!dataUrl) {
        throw new Error("Could not read selected image file.");
      }

      return apiClient("/api/users/avatar-upload", {
        method: "POST",
        body: JSON.stringify({ fileDataUrl: dataUrl }),
      }) as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      setValue("avatar", data.url, { shouldDirty: true });
      toast.success("Avatar uploaded successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Avatar upload failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditProfileFormValues) =>
      apiClient("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          newPassword: data.newPassword,
          avatar: data.avatar,
          bio: data.bio,
          phone: data.phone,
          address: data.address,
        }),
      }) as Promise<ProfileData>,
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await update({ name: updatedProfile.name, email: updatedProfile.email });
      toast.success("Profile updated successfully");
      router.push("/profile");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update profile");
    },
  });

  const onSubmit = (data: EditProfileFormValues) => {
    updateMutation.mutate(data);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image size must be 2MB or less.");
      event.target.value = "";
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Edit Profile</CardTitle>
            <CardDescription>Loading your account details...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52 rounded-2xl border border-border bg-muted/50" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Edit Profile</CardTitle>
            <CardDescription>Sign in first to edit your profile.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <Loading label="Loading profile edit..." fullScreen />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Edit Profile</CardTitle>
            <CardDescription>We could not load your profile right now.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/profile">Back to Profile</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/profile/edit">Retry</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-5xl text-secondary sm:text-6xl">Edit Profile</CardTitle>
          <CardDescription>Update your account details and save when you are ready.</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Minimum 2 characters" },
                  })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("newPassword", {
                    validate: (value) => !value || value.length >= 8 || "Minimum 8 characters",
                  })}
                />
                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword", {
                    validate: (value) => {
                      if (!newPasswordValue) {
                        return true;
                      }

                      return value === newPasswordValue || "Passwords do not match";
                    },
                  })}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadAvatarMutation.isPending}
                />
                <input type="hidden" {...register("avatar")} />
                {uploadAvatarMutation.isPending && (
                  <p className="text-sm text-muted-foreground">Uploading avatar image...</p>
                )}
                <p className="text-xs text-muted-foreground">Allowed: JPG, PNG, WEBP, GIF. Max size: 2MB.</p>
                {avatarPreview && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-card">
                      <Image src={avatarPreview} alt="Avatar preview" fill sizes="56px" className="object-cover" />
                    </div>
                    <p className="text-sm text-muted-foreground">Avatar selected and ready to save.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  rows={4}
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("bio")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" type="text" autoComplete="street-address" {...register("address")} />
              </div>
            </div>

            {updateMutation.error && (
              <p className="text-sm text-red-500">
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : "Something went wrong. Please try again."}
              </p>
            )}
          </form>
        </CardContent>

        <CardFooter className="justify-start gap-2">
          <Button variant="outline" asChild>
            <Link href="/profile">Cancel</Link>
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            disabled={updateMutation.isPending || uploadAvatarMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
