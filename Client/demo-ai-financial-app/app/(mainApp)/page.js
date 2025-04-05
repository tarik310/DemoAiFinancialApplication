import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-40 pb-20 px-4">
        <div className="container text-center flex flex-col items-center gap-4">
          <h1 className="max-w-lg text-3xl md:text-4xl lg:text-[48px] gradient-title">
            Smarter Finance Management, Powered by AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered money companion—track, analyze, and optimize your finances
            with ease and intelligence.
          </p>
          <div className="flex flex-col items-center gap-3 px-4">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/demo/dashboard" className="flex flex-col items-center gap-1">
              <Button size="lg" variant="outline">
                Interact with demo dashboard
              </Button>
              <span className="text-xs">No login required</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
