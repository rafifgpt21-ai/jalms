import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google"; // [NEW] Premium fonts
import "./globals.css";
import { Toaster } from "sonner";


// [NEW] Primary Heading Font - Geometric & Modern
const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// [NEW] Body Font - Clean & Legible
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arsync",
  description: "Arsync application",
  icons: {
    icon: "https://jjuy48ud0l.ufs.sh/f/h9KMQVU48dkngJ8vJO6mplvt3DPjiHqOXYorsf8C5zRhynb2",
    apple: "https://jjuy48ud0l.ufs.sh/f/h9KMQVU48dkngJ8vJO6mplvt3DPjiHqOXYorsf8C5zRhynb2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans bg-fixed bg-linear-to-br from-indigo-200 via-rose-100/50 to-cyan-200 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 min-h-screen`}
        suppressHydrationWarning
      >

        {children}
        <Toaster />
      </body>
    </html>
  );
}
