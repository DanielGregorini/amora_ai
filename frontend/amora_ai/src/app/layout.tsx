import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amora AI",
  description: "amora is so cute ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
