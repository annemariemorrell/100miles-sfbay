import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "100 Miles SF Bay",
  description: "Track open water swims at Aquatic Park toward a 100-mile season goal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
