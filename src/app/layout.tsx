import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk } from "next/font/google";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "AutoBudget AI",
  description: "AI-powered financial advice and spending analysis.",
};

// 👇 Move layout logic into a Client Component
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Show sidebar only on dashboard routes
  const showSidebar = pathname?.startsWith("/dashboard");

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <aside className="w-64 bg-muted p-4 hidden md:block">
          <nav className="space-y-4">
            <a href="/dashboard" className="block font-medium">Dashboard</a>
            <a href="/dashboard/budgets" className="block font-medium">Budgets</a>
            <a href="/dashboard/ai-assistant" className="block font-medium">AI Assistant</a>
            <a href="/dashboard/financial-wellness" className="block font-medium">Wellness</a>
          </nav>
        </aside>
      )}

      {/* Main content expands whether sidebar exists or not */}
      <main className="flex-1 overflow-y-auto bg-background ">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body bg-background antialiased m-0 p-0`}
      >
        {/* Wrap children in AppLayout to conditionally render sidebar */}
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
