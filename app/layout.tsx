import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice-to-Diagram",
  description: "Speak to create architecture diagrams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
