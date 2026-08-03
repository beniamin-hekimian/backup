import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Menu, X, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/orders", label: "Orders" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const router = useRouter();
  const { status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);

    router.events.on("routeChangeStart", closeMenu);

    return () => {
      router.events.off("routeChangeStart", closeMenu);
    };
  }, [router.events]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <Image src="/logo.webp" alt="Etbokhly" width={40} height={40} />
          <span className="font-display text-3xl tracking-wide text-secondary sm:text-4xl">Etbokhly</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(router.pathname, link.href);

            return (
              <Button key={link.href} asChild variant={active ? "secondary" : "ghost"} size="sm" className="px-4">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "authenticated" ? (
            <Button asChild variant="outline" size="sm" className="gap-2 rounded-full px-4">
              <Link href="/profile" aria-label="Open profile">
                <UserCircle2 className="size-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full px-4">
              <Link href="/signup">Signup</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {status === "authenticated" ? (
            <Button asChild variant="outline" size="icon-sm" className="rounded-full">
              <Link href="/profile" aria-label="Open profile">
                <UserCircle2 className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full px-4">
              <Link href="/signup">Signup</Link>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`border-t border-border/70 bg-background/95 px-4 backdrop-blur-xl transition-all duration-200 md:hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
          {navLinks.map((link) => {
            const active = isActivePath(router.pathname, link.href);

            return (
              <Button key={link.href} asChild variant={active ? "secondary" : "ghost"} className="justify-start">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
