import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Catch Phrase Admin",
  description: "Manage your catch phrases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}