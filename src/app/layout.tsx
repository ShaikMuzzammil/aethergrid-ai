import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: { default: "AetherGrid AI — Edge AI Platform", template: "%s | AetherGrid AI" },
  description: "Deploy, monitor, and scale AI models from $3 ESP32 microcontrollers to NVIDIA GPU clusters. The world's most capable edge AI platform.",
  keywords: ["edge AI", "IoT", "ESP32", "Jetson", "ML deployment", "edge computing", "IoT platform"],
  authors: [{ name: "Shaik Muzzammil", url: "https://linktr.ee/Shaik_Muzzammil" }],
  openGraph: {
    title: "AetherGrid AI — Edge AI Platform",
    description: "Deploy AI to any device. Manage billions of IoT devices with real-time analytics, automated workflows, and enterprise security.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: { background: "#0a0e1a", border: "1px solid rgba(0,212,255,0.2)", color: "#e2e8f0" },
              classNames: { success: "!border-green-500/30", error: "!border-red-500/30", info: "!border-cyan-500/30" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
