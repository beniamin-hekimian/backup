import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

type TagRecord = {
  id: string;
  name: string;
};

type MealCreateFormValues = {
  name: string;
  description: string;
  price: string;
  photo: string;
  tags: string[];
};

type MealCreateResponse = {
  message: string;
  meal: {
    id: string;
    name: string;
  };
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read selected image file."));
    reader.readAsDataURL(file);
  });
}

export default function ChefMealCreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<MealCreateFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      photo: "",
      tags: [],
    },
  });

  const selectedTags = useWatch({ control, name: "tags" }) ?? [];

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient("/api/users/profile") as Promise<ProfileData>,
    enabled: status === "authenticated",
  });

  const tagsQuery = useQuery({
    queryKey: ["meal-tags"],
    queryFn: () => apiClient("/api/tags") as Promise<TagRecord[]>,
    enabled: status === "authenticated",
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await readFileAsDataUrl(file);

      if (!dataUrl) {
        throw new Error("Could not read selected image file.");
      }

      return apiClient("/api/meals/photo-upload", {
        method: "POST",
        body: JSON.stringify({ fileDataUrl: dataUrl }),
      }) as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      setValue("photo", data.url, { shouldDirty: true, shouldValidate: true });
      setImagePreview(data.url);
      toast.success("Meal image uploaded successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    },
  });

  const createMealMutation = useMutation({
    mutationFn: (values: MealCreateFormValues) =>
      apiClient("/api/meals", {
        method: "POST",
        body: JSON.stringify(values),
      }) as Promise<MealCreateResponse>,
    onSuccess: (data) => {
      toast.success(data.message);
      reset({ name: "", description: "", price: "", photo: "", tags: [] });
      setImagePreview("");
      router.push("/meals");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create meal");
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    uploadImageMutation.mutate(file);
  };

  const toggleTag = (tagName: string) => {
    const nextTags = selectedTags.includes(tagName)
      ? selectedTags.filter((value) => value !== tagName)
      : selectedTags.length < 5
        ? [...selectedTags, tagName]
        : selectedTags;

    setValue("tags", nextTags, { shouldDirty: true, shouldValidate: true });
  };

  const selectedTagCountLabel = `${selectedTags.length} selected`;

  const onSubmit = (values: MealCreateFormValues) => {
    createMealMutation.mutate(values);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Create Meal</CardTitle>
            <CardDescription>Loading your account details...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-2xl border border-border bg-muted/50" />
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
            <CardTitle className="font-display text-5xl text-secondary">Create Meal</CardTitle>
            <CardDescription>Sign in first to create a meal.</CardDescription>
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
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Create Meal</CardTitle>
            <CardDescription>Loading your profile details...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-2xl border border-border bg-muted/50" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Create Meal</CardTitle>
            <CardDescription>We could not load your profile right now.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/profile">Back to Profile</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/chef/meals/create">Retry</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (profileQuery.data.role !== "chef") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary">Create Meal</CardTitle>
            <CardDescription>Only approved chefs can create meals.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/profile">Back to Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary sm:text-6xl">Create Meal</CardTitle>
            <CardDescription>
              Add a new dish, upload a photo, and tag it so customers can find it faster.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="create-meal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter the meal name"
                    {...register("name", {
                      required: "Meal name is required",
                      minLength: { value: 3, message: "Minimum 3 characters" },
                    })}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the meal, its ingredients, and any other details"
                    {...register("description", {
                      required: "Meal description is required",
                      minLength: { value: 20, message: "Please add at least 20 characters" },
                    })}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter the meal price"
                    {...register("price", {
                      required: "Price is required",
                      validate: (value) => {
                        const parsed = Number(value);
                        return (Number.isFinite(parsed) && parsed > 0) || "Enter a valid price";
                      },
                    })}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoFile">Meal Image</Label>
                  <Input id="photoFile" type="file" accept="image/*" onChange={handleImageChange} />
                  <input type="hidden" {...register("photo", { required: "Meal image is required" })} />
                  {uploadImageMutation.isPending && <p className="text-sm text-muted-foreground">Uploading image...</p>}
                  <p className="text-xs text-muted-foreground">Allowed: JPG, PNG, WEBP, GIF. Max size: 5MB.</p>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label>Tags</Label>
                    <p className="text-sm text-muted-foreground">{selectedTagCountLabel}</p>
                  </div>
                  <input
                    type="hidden"
                    {...register("tags", {
                      validate: (value) => {
                        const count = value?.length ?? 0;
                        return (count >= 3 && count <= 5) || "Select between 3 and 5 tags";
                      },
                    })}
                  />

                  {tagsQuery.isLoading ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                      Loading tags...
                    </div>
                  ) : tagsQuery.isError ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-red-500">
                      Could not load tags right now.
                    </div>
                  ) : tagsQuery.data && tagsQuery.data.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tagsQuery.data.map((tag) => {
                        const isSelected = selectedTags.includes(tag.name);

                        return (
                          <Button
                            key={tag.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTag(tag.name)}
                            className="capitalize"
                          >
                            {tag.name.replace("-", " ")}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                      No tags are available yet.
                    </div>
                  )}

                  {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-muted-foreground">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Image preview</p>
                        <p className="text-sm text-muted-foreground">
                          Your uploaded meal image will appear here once the upload is complete.
                        </p>
                        {imagePreview ? (
                          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background">
                            <div
                              className="h-56 w-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${imagePreview})` }}
                              role="img"
                              aria-label="Meal preview"
                            />
                          </div>
                        ) : (
                          <div className="mt-3 flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                            No image selected yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {createMealMutation.isError && (
                <p className="text-sm text-red-500">
                  {createMealMutation.error instanceof Error
                    ? createMealMutation.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}
            </form>
          </CardContent>

          <CardFooter className="justify-start gap-2">
            <Button variant="outline" asChild>
              <Link href="/meals">Cancel</Link>
            </Button>
            <Button
              type="submit"
              form="create-meal-form"
              disabled={createMealMutation.isPending || uploadImageMutation.isPending}
            >
              {createMealMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Meal
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
