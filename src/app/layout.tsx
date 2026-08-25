import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AetherGrid AI — World-Scale Edge AI Platform",
    template: "%s | AetherGrid AI",
  },
  description: "Enterprise-ready platform bridging distributed hardware edge nodes, localized AI runtimes, and multi-tenant cloud-native control console.",
  keywords: ["IoT", "Edge AI", "Machine Learning", "ESP32", "Raspberry Pi", "NVIDIA Jetson", "Edge Computing"],
  authors: [{ name: "AetherGrid AI Team" }],
  openGraph: {
    title: "AetherGrid AI — World-Scale Edge AI Platform",
    description: "From $3 ESP32 chips to GPU clusters — deploy AI anywhere, at any scale.",
    type: "website",
    url: "https://aethergrid.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "AetherGrid AI",
    description: "World-Scale Autonomous Edge AI & Hardware OS Ecosystem",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
