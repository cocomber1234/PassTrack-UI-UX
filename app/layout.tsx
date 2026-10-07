import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PASSTRACK | Passport services portal",
    template: "%s | PASSTRACK",
  },
  description: "Securely follow your passport application, documents, and inquiries.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
