import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  Clock, 
  ShieldCheck, 
  UtensilsCrossed, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface MealDetail {
  id: string;
  name: string;
  description: string | null;
  price: string;
  photo: string | null;
  createdAt: string;
  chefName: string;
  chefBio?: string | null;
}

export default function MealDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    // Adjust endpoint based on how your backend structure serves a specific ID profile
    apiClient(`/api/meals?id=${id}`)
      .then((data) => {
        // Fallback fallback parsing array values if sharing general listings endpoint
        const targetedMeal = Array.isArray(data?.meals) ? data.meals.find((m: any) => m.id === id) : data?.meal;

        if (!targetedMeal) {
          throw new Error("This culinary masterpiece could not be found.");
        }
        setMeal(targetedMeal);
      })
      .catch((err) => {
        console.error("Error retrieving detailed meal view:", err);
        setError(err?.message || "Failed to download item metrics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-sans text-muted-foreground text-sm font-medium">
            Preparing kitchen perspective details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm border border-border p-6 rounded-xl bg-card flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="text-destructive font-sans font-medium mb-1">Meal Unavailable</p>
            <p className="text-muted-foreground text-xs font-sans">{error || "The link may be broken or expired."}</p>
          </div>
          <Button asChild size="sm" className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/meals">Return to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 max-w-6xl mx-auto">
      {/* 1. BACK TO NAVIGATION ROW */}
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="font-sans text-muted-foreground hover:text-foreground -ml-2"
        >
          <Link href="/meals" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to discoveries
          </Link>
        </Button>
      </div>

      {/* 2. SPLIT INTERFACE GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: HERO VISUAL MEDIA CONTAINER (7 Columns) */}
        <div className="md:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted border border-border">
            <Image
              src={meal.photo || "/images/placeholder-meal.png"}
              alt={meal.name}
              fill
              sizes="(max-w-768px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Trust Elements Sub-banner badge array */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 p-3 rounded-xl border border-border flex flex-col items-center text-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
                Kitchen Fresh
              </span>
            </div>
            <div className="bg-muted/40 p-3 rounded-xl border border-border flex flex-col items-center text-center gap-1">
              <UtensilsCrossed className="w-4 h-4 text-accent" />
              <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
                Homemade
              </span>
            </div>
            <div className="bg-muted/40 p-3 rounded-xl border border-border flex flex-col items-center text-center gap-1">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
                Verified Chef
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE TICKET SUMMARY (5 Columns) */}
        <div className="md:col-span-5 space-y-6">
          {/* Title and Badge Metadata Context Block */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-sans">
              <Badge className="bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90">
                Live Batch Offer
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-accent font-semibold">
                <User className="w-3.5 h-3.5" />
                <span>Chef {meal.chefName}</span>
              </div>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wide text-foreground leading-tight">
              {meal.name}
            </h1>
          </div>

          {/* Pricing Row Framework */}
          <div className="border-y border-border py-4 flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-sm font-medium">Price per serving</span>
            <div className="text-3xl font-sans font-extrabold text-foreground tracking-tight">
              ${parseFloat(meal.price).toFixed(2)}
            </div>
          </div>

          {/* Main Description */}
          <div className="space-y-2">
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Chef's Description
            </h3>
            <p className="font-sans text-base text-foreground leading-relaxed">
              {meal.description ||
                "This item is freshly prepared by hand using premium, organic marketplace components sourced from approved localized growers."}
            </p>
          </div>

          {/* Checkout Interaction Panel Card Shell */}
          <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
            <CardContent className="p-0 space-y-4">
              {/* Quantity Incrementor */}
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-medium text-foreground">Select Quantity</span>
                <div className="flex items-center border border-input rounded-lg overflow-hidden h-9 bg-background">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 text-muted-foreground hover:bg-muted text-sm font-sans font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-sans font-bold text-sm text-foreground min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 text-muted-foreground hover:bg-muted text-sm font-sans font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Calculation Row */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="font-sans text-xs text-muted-foreground">Total order valuation</span>
                <span className="font-sans text-xl font-black text-foreground">
                  ${(parseFloat(meal.price) * quantity).toFixed(2)}
                </span>
              </div>

              {/* Core Submission Trigger Action Button */}
              <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold flex items-center justify-center gap-2 rounded-xl text-sm">
                <ShoppingBag className="w-4 h-4" />
                Add {quantity} to Bag
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}