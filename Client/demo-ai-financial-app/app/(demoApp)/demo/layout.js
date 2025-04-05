import { Inter } from "next/font/google";
import "../../globals.css";
import { Toaster } from "sonner";
import HeaderDemo from "@/components/headerDemo";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinGenius AI",
  description: "Smart Finance Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/smLogo.svg" sizes="any" />
      </head>
      <body className={`${inter.className}`}>
        <HeaderDemo />
        <main className="min-h-screen">{children}</main>
        <Toaster richColors />

        <footer className="bg-blue-50 py-4">
          <div className="container mx-auto px-4 text-right text-gray-600">
            <p>
              Made with diligence by <strong>Tareq Harh</strong>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
