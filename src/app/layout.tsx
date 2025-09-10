import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "AutoBudget AI",
  description: "AI-powered financial advice and spending analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body bg-background antialiased`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-muted p-4 hidden md:block">
            <nav className="space-y-4">
              <a href="/dashboard" className="block font-medium">Dashboard</a>
              <a href="/budgets" className="block font-medium">Budgets</a>
              <a href="/assistant" className="block font-medium">AI Assistant</a>
              <a href="/wellness" className="block font-medium">Wellness</a>
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        <Toaster />
      </body>
    </html>
  );
}
