import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Web Harmonium | Premium Music Experience",
  description: "A professional, modern web harmonium and music streaming application.",
};

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
      <body className="min-h-full font-sans bg-black text-white selection:bg-harmonium-accent/20 overflow-x-hidden">
        <AudioProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AudioProvider>
      </body>
    </html>
  );
}
