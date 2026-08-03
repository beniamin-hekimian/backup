import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Amatic_SC, Merriweather, Open_Sans } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const amaticaSC = Amatic_SC({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-amatica-sc",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider session={pageProps.session}>
        <QueryClientProvider client={queryClient}>
          <main className={`${openSans.className} ${openSans.variable} ${amaticaSC.variable} ${merriweather.variable}`}>
            <Head>
              <title>Etbokhly - Homemade Food Selling Web App</title>
            </Head>
            <Navbar />
            <Component {...pageProps} />
            <Toaster />
          </main>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
