import type { Metadata } from "next";
import "./globals.css";
import { ClientWrapper } from "./components/ClientWrapper";

export const metadata: Metadata = {
  title: "🆆🤫 Nillion Secret Wordle",
  description: "Wordle-like game that uses the Nillion network to compute on secret data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
