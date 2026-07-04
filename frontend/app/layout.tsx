import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "National Portal of India | india.gov.in",
  description:
    "Access government services, schemes, citizen resources and public information through the National Portal of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
