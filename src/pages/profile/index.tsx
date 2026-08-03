import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/loading";

const profileFields = [
  { label: "Name", key: "name" },
  { label: "Email", key: "email" },
  { label: "Role", key: "role" },
  { label: "User ID", key: "id" },
  { label: "Phone", key: "phone" },
  { label: "Address", key: "address" },
  { label: "Bio", key: "bio" },
] as const;

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

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient("/api/users/profile") as Promise<ProfileData>,
    enabled: status === "authenticated",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="font-display text-4xl text-secondary">Profile</CardTitle>
              <CardDescription>Loading your account details...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded-2xl border border-border bg-muted/50" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-5xl text-secondary">Profile</CardTitle>
              <CardDescription>Sign in to view your account information.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <Loading label="Loading profile..." fullScreen />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-5xl text-secondary">Profile</CardTitle>
              <CardDescription>We could not load your profile right now.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Button variant="secondary" asChild>
                <Link href="/profile">Retry</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const avatarSrc = profile.avatar?.trim() ? profile.avatar : "/avatar.webp";
  const profileValueMap = {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    id: profile.id,
    phone: profile.phone ?? "Not provided",
    address: profile.address ?? "Not provided",
    bio: profile.bio ?? "No bio added yet.",
  } satisfies Record<(typeof profileFields)[number]["key"], string>;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="font-display text-5xl text-secondary sm:text-6xl">Profile</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            A simple account view for your name, email, role, and avatar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
            <Button asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>

            {profile.role === "customer" && (
              <Button variant="outline" asChild>
                <Link href="/profile/become-a-chef">Become a Chef</Link>
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid gap-0 md:grid-cols-[auto_1fr]">
              <div className="border-b border-border bg-card p-6 md:border-b-0 md:border-r">
                <div className="flex flex-col items-center gap-4 text-center md:text-left">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border border-border bg-muted shadow-sm sm:h-36 sm:w-36">
                    <Image
                      src={avatarSrc}
                      alt={`${profileValueMap.name} avatar`}
                      fill
                      priority
                      sizes="(max-width: 768px) 8rem, 9rem"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="font-heading text-2xl sm:text-3xl">{profileValueMap.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{profileValueMap.email}</CardDescription>
                    <Button variant="secondary" size="sm" disabled className="cursor-default">
                      {profileValueMap.role}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {profileFields.map((field) => (
                    <Card key={field.key} size="sm" className="bg-background">
                      <CardHeader className="pb-2">
                        <CardDescription>{field.label}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="wrap-break-word font-heading text-xl text-foreground sm:text-2xl">
                          {profileValueMap[field.key]}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  This view keeps the layout clean and focused on the core account details.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
