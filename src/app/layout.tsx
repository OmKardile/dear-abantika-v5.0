import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeApplier } from "@/components/providers/theme-applier";
import { UndoProvider } from "@/components/providers/undo-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Abantika — Premium Wellness Companion",
  description:
    "A luxurious, private wellness companion for hydration, mood, cycle, journaling and mindful reminders.",
  keywords: [
    "wellness",
    "hydration",
    "mood",
    "cycle tracker",
    "journal",
    "mindfulness",
  ],
  authors: [{ name: "Abantika" }],
  applicationName: "Abantika",
  generator: "Abantika v5.0",
  other: { version: "5.0" },
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="linen">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <ThemeApplier>
          <UndoProvider>{children}</UndoProvider>
        </ThemeApplier>
        <Toaster />
      </body>
    </html>
  );
}
