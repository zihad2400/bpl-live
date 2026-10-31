import { Suspense } from "react";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "BPL LIVE — Cricket Scoring",
  description: "Premium Cricket League Platform",
};

function NavFallback() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-midnight/70 border-b border-white/10 h-[60px]" />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={<NavFallback />}>
            <Nav />
          </Suspense>
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
            {children}
          </main>
          
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
