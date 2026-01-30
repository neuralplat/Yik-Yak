import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/components/features/LocationProvider";
import { AuthProvider } from "@/components/features/AuthProvider";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YakClone",
  description: "Anonymous local herds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <LocationProvider>
            <main className="min-h-screen pb-20 max-w-[1920px] mx-auto relative bg-gray-100">
              {/* Desktop: Centered Content Container */}
              <div className="max-w-4xl mx-auto min-h-screen bg-white shadow-xl border-x">
                {children}
              </div>
            </main>
            <MobileNav />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
