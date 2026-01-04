import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/hooks/useToast";

export const metadata: Metadata = {
  title: "Dailishaw - Internal Pharma Software",
  description:
    "Internal pharmaceutical software management system with role-based access control",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#ea580c", // orange-600
  manifest: "/manifest.json",
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
