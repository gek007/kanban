import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnnouncementProvider } from "@/hooks/useAnnouncement";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanban Board MVP",
  description: "Single-board Kanban app MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <ErrorBoundary>
          <AnnouncementProvider>{children}</AnnouncementProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
