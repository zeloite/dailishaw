import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/hooks/useToast";

export const metadata: Metadata = {
  title: "Dailishaw - Internal Pharma Software",
  description: "Internal pharmaceutical software management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className="bg-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
