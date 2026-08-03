import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type MealStatus = "pending" | "approved" | "rejected";

type MealRow = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  price: string;
  photo: string | null;
  status: MealStatus;
  verifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    role: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
};

type SortField = "createdAt" | "verifiedAt" | "name" | "email" | "status" | "price";
type SortDirection = "asc" | "desc";

const statusLabels: Record<MealStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const statusVariants: Record<MealStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not verified";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sortValue(row: MealRow, field: SortField) {
  switch (field) {
    case "name":
      return row.name.toLowerCase();
    case "email":
      return row.user.email.toLowerCase();
    case "status":
      return row.status;
    case "price":
      return Number(row.price);
    case "verifiedAt":
      return row.verifiedAt ? new Date(row.verifiedAt).getTime() : -1;
    case "createdAt":
    default:
      return new Date(row.createdAt).getTime();
  }
}

type SortHeaderButtonProps = {
  field: SortField;
  label: string;
  active: boolean;
  direction: SortDirection;
  onToggle: (field: SortField) => void;
};

function SortHeaderButton({ field, label, active, direction, onToggle }: SortHeaderButtonProps) {
  return (
    <Button type="button" variant="ghost" size="xs" className="-ml-2 h-8 px-2 text-xs" onClick={() => onToggle(field)}>
      <span>{label}</span>
      {active ? (
        direction === "asc" ? (
          <ArrowUpAZ className="size-3.5" />
        ) : (
          <ArrowDownAZ className="size-3.5" />
        )
      ) : (
        <SlidersHorizontal className="size-3.5 opacity-60" />
      )}
    </Button>
  );
}

export default function AdminMealsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status: sessionStatus } = useSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MealStatus>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, sessionStatus]);

  const mealsQuery = useQuery({
    queryKey: ["admin-meals"],
    queryFn: () => apiClient("/api/admin/meals") as Promise<{ meals: MealRow[] }>,
    enabled: sessionStatus === "authenticated",
  });

  const reviewMutation = useMutation({
    mutationFn: async (payload: { mealId: string; status: Exclude<MealStatus, "pending"> }) => {
      return apiClient(`/api/admin/meals/${payload.mealId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: payload.status }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-meals"] });
    },
  });

  const rows = useMemo(() => mealsQuery.data?.meals ?? [], [mealsQuery.data]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) {
          return false;
        }

        if (!needle) {
          return true;
        }

        return [
          row.name,
          row.description ?? "",
          row.user.name,
          row.user.email,
          row.user.phone ?? "",
          row.status,
          row.tags.map((tag) => tag.name).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((left, right) => {
        const leftValue = sortValue(left, sortField);
        const rightValue = sortValue(right, sortField);

        if (typeof leftValue === "number" && typeof rightValue === "number") {
          return sortDirection === "asc" ? leftValue - rightValue : rightValue - leftValue;
        }

        const leftText = String(leftValue);
        const rightText = String(rightValue);

        return sortDirection === "asc" ? leftText.localeCompare(rightText) : rightText.localeCompare(leftText);
      });
  }, [rows, search, sortDirection, sortField, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((row) => row.status === "pending").length,
      approved: rows.filter((row) => row.status === "approved").length,
      rejected: rows.filter((row) => row.status === "rejected").length,
    }),
    [rows],
  );

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection(field === "createdAt" ? "desc" : "asc");
  }

  if (sessionStatus === "loading" || mealsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (mealsQuery.isError) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto w-full max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-4xl text-secondary">Meal Requests</CardTitle>
              <CardDescription>We could not load meal requests right now.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => mealsQuery.refetch()}>
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-heading text-sm uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="font-display text-5xl text-secondary">Meal Requests</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review meals created by chefs, filter by status, and sort by creator, price, or verification date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card size="sm" className="bg-background/80">
              <CardContent className="space-y-1 py-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-heading text-2xl text-foreground">{stats.total}</p>
              </CardContent>
            </Card>
            <Card size="sm" className="bg-background/80">
              <CardContent className="space-y-1 py-3">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-heading text-2xl text-foreground">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card size="sm" className="bg-background/80">
              <CardContent className="space-y-1 py-3">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="font-heading text-2xl text-foreground">{stats.approved}</p>
              </CardContent>
            </Card>
            <Card size="sm" className="bg-background/80">
              <CardContent className="space-y-1 py-3">
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="font-heading text-2xl text-foreground">{stats.rejected}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="gap-4 border-b">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="font-display text-3xl text-secondary">Manage meal approvals</CardTitle>
                <CardDescription>
                  Approve or reject meals submitted by chefs. Approved and rejected meals are stamped with verification
                  time.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={statusFilter === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(value)}
                  >
                    {value === "all" ? "All" : statusLabels[value]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by meal, chef, tags, or status"
                  className="pl-10"
                />
              </div>

              <Button variant="outline" onClick={() => mealsQuery.refetch()}>
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeaderButton
                      field="name"
                      label="Meal"
                      active={sortField === "name"}
                      direction={sortDirection}
                      onToggle={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeaderButton
                      field="email"
                      label="Chef"
                      active={sortField === "email"}
                      direction={sortDirection}
                      onToggle={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeaderButton
                      field="status"
                      label="Status"
                      active={sortField === "status"}
                      direction={sortDirection}
                      onToggle={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeaderButton
                      field="price"
                      label="Price"
                      active={sortField === "price"}
                      direction={sortDirection}
                      onToggle={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeaderButton
                      field="createdAt"
                      label="Created"
                      active={sortField === "createdAt"}
                      direction={sortDirection}
                      onToggle={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeaderButton
                      field="verifiedAt"
                      label="Verified"
                      active={sortField === "verifiedAt"}
                      direction={sortDirection}
                      onToggle={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                      No meal requests match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((meal) => {
                    const canReview = meal.status === "pending";

                    return (
                      <TableRow key={meal.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-heading text-base text-foreground">{meal.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {meal.tags.length > 0 ? meal.tags.map((tag) => tag.name).join(", ") : "No tags"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-foreground">{meal.user.name}</div>
                            <div className="text-sm text-muted-foreground">{meal.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[meal.status]}>{statusLabels[meal.status]}</Badge>
                        </TableCell>
                        <TableCell>${Number(meal.price).toFixed(2)}</TableCell>
                        <TableCell>{formatDate(meal.createdAt)}</TableCell>
                        <TableCell>{formatDate(meal.verifiedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="default"
                              disabled={!canReview || reviewMutation.isPending}
                              onClick={() => reviewMutation.mutate({ mealId: meal.id, status: "approved" })}
                            >
                              <CheckCircle2 className="size-4" />
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={!canReview || reviewMutation.isPending}
                              onClick={() => reviewMutation.mutate({ mealId: meal.id, status: "rejected" })}
                            >
                              <CircleAlert className="size-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-6 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Pending meals can be reviewed once. VerifiedAt is set when the admin approves or rejects a meal.
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <ShieldCheck className="size-4" />
              Admin access required
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
