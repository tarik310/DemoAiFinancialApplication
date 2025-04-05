import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import FinGeniusAILogo from "./icons/FinGeniusAILogo";

const HeaderDemo = async () => {
  // await checkUser();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex gap-3 items-center">
          <FinGeniusAILogo />
          <span className="text-xl font-bold text-[#202020]">FinGenius AI</span>
        </Link>
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <div className="font-bold text-red-700">DEMO DASHBOARD</div>
          <Link
            href="/demo/dashboard"
            className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
          >
            <Button variant="outline">
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
          </Link>
          <a href="/demo/transaction/create">
            <Button className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Add Transaction</span>
            </Button>
          </a>
        </div>
      </nav>
    </header>
  );
};

export default HeaderDemo;
