"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, DollarSign, Target } from "lucide-react";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <Button asChild variant="ghost">
          <Link href="/auth/login">
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 lg:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter">
                Take Control of Your Finances with <span className="text-primary">AutoBudget AI</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Your personal AI-powered financial advisor. Track income, manage expenses, and get smart insights to achieve your financial goals faster.
              </p>
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Image
                src="https://placehold.co/600x400.png"
                alt="AutoBudget AI Dashboard Preview"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="dashboard finance"
              />
            </div>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Features Designed for You</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage your money effectively and make smarter financial decisions.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="inline-block bg-primary/10 text-primary p-3 rounded-full">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Track Everything</h3>
                  <p className="text-muted-foreground">
                    Easily log your income and expenses. Categorize transactions to see where your money is going.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="inline-block bg-primary/10 text-primary p-3 rounded-full">
                    <Target className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Plan Your Budget</h3>
                  <p className="text-muted-foreground">
                    Set financial goals and create budgets that work for you. We'll help you stay on track.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                   <div className="inline-block bg-primary/10 text-primary p-3 rounded-full">
                    <Bot className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Get AI Insights</h3>
                  <p className="text-muted-foreground">
                    Receive personalized advice and analysis from our AI to optimize your spending and savings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {year || new Date().getFullYear()} AutoBudget AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
