import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Imported Next.js Link
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, User, Search, Utensils } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Loading } from "@/components/loading";

interface MealRow {
  id: string;
  name: string;
  description: string | null;
  price: string;
  photo: string | null;
  createdAt: string;
  chefName: string;
}

export default function MealsPage() {
  const [meals, setMeals] = useState<MealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    apiClient("/api/meals")
      .then((data) => {
        setMeals(data?.meals || []);
      })
      .catch((err) => {
        console.error("Error fetching marketplace meals:", err);
        setError(err?.message || "Could not retrieve marketplace listings.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredMeals = meals.filter(
    (meal) =>
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meal.description && meal.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      meal.chefName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <Loading label="Loading meals..." fullScreen />
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm border border-border p-6 rounded-xl bg-card">
          <p className="text-destructive font-sans font-medium mb-2">Something went wrong</p>
          <p className="text-muted-foreground text-sm font-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 max-w-7xl mx-auto">
      {/* 1. HERO BANNER ZONE */}
      <div className="flex flex-col gap-6 border-b border-border pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-6xl md:text-7xl font-bold tracking-wide text-foreground leading-none">
              Freshly Made Kitchen Discoveries
            </h1>
            <p className="font-sans text-muted-foreground mt-3 text-base md:text-lg">
              Order authentic, home-cooked delicacies crafted dynamically by verified neighborhood chefs.
            </p>
          </div>
          <Badge className="w-fit bg-muted text-muted-foreground border border-border px-3 py-1 font-sans text-sm h-fit shrink-0 whitespace-nowrap">
            {filteredMeals.length} Meals Available
          </Badge>
        </div>

        {/* 2. RESPONSIVE SEARCH INPUT OVERLAY */}
        <div className="relative max-w-md w-full mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-input" />
          <Input
            type="text"
            placeholder="Search meals, ingredients, or local chefs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-input bg-card font-sans rounded-lg focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 text-foreground placeholder:text-input"
          />
        </div>
      </div>

      {/* 3. ULTRA-MODERN MEAL GRID */}
      {filteredMeals.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl bg-card max-w-lg mx-auto px-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Utensils className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-sans font-semibold text-lg text-foreground mb-1">No meals matches found</h3>
          <p className="text-muted-foreground font-sans text-sm">
            Try adjustments to your search terms or verify kitchen schedules later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMeals.map((meal) => (
            <Card
              key={meal.id}
              className="relative group overflow-hidden rounded-xl bg-card border border-border hover:shadow-sm transition-all duration-200 flex flex-col justify-between py-0"
            >
              {/* Tight Picture Area with Floating Badges */}
              <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                <Image
                  src={meal.photo || "/placeholder-food.jpg"}
                  alt={meal.name}
                  fill
                  sizes="(max-w-640px) 100vw, (max-w-768px) 50vw, (max-w-1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-103 transition-transform duration-300"
                  priority={false}
                />

                {/* Floating Clean Metadata */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-sans font-medium">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>{meal.chefName}</span>
                </div>
              </div>

              {/* Compressed, Content-First Core Section */}
              <CardContent className="px-4 py-3 grow flex flex-col justify-between gap-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-foreground line-clamp-1">
                    {/* Stretched Link Overlay Class makes the entire parent card clickable */}
                    <Link
                      href={`/meals/${meal.id}`}
                      className="focus:outline-none after:absolute after:inset-0 after:z-0"
                    >
                      {meal.name}
                    </Link>
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {meal.description || "Handcrafted daily with premium, organic local marketplace ingredients."}
                  </p>
                </div>

                {/* Inline Action Row with Price Positioning */}
                <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                  <div className="font-sans font-bold">
                    ${parseFloat(meal.price).toFixed(2)}
                  </div>

                  {/* z-10 ensures the interactive action button handles cart clicks directly over the link overlay */}
                  <Button
                    size="sm"
                    className="relative z-10 h-8 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 font-sans font-medium rounded-lg text-xs px-3"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
