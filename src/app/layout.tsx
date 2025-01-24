import ErrorBoundary from "@/components/ErrorBoundary";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Search App",
  description: "Find jobs near you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
