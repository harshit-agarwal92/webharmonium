import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { MainLayout } from "@/components/MainLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF007F",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://masti.app"),
  title: "Masti Music | Nonstop Vibe",
  description: "A fun, modern web harmonium and music streaming application.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Masti Music",
    statusBarStyle: "black-translucent",
  },
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased dark`}
    >
      <body className="min-h-full font-sans bg-black text-white selection:bg-masti-pink/20 overflow-x-hidden">
        <AuthProvider>
          <AudioProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
