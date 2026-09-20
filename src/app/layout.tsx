import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Taekwondo Weigh-In Management System",
  description: "Professional tournament weigh-in management, category segregation, and official passed roster certification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 flex flex-col min-h-screen antialiased">
        {/* Upper Workspace: Sidebar + Main Application Shell */}
        <div className="flex-1 flex min-w-0">
          {/* Sidebar (suppressed during print via globals.css) */}
          <Sidebar />

          {/* Main Application Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#F8FAFC]">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Full-Screen Edge-to-Edge Official Footer */}
        <Footer />
      </body>
    </html>
  );
}
