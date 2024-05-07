import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { type Metadata } from "next";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Steam Completed Games",
  description: "A list of the games I've completed on Steam.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
} satisfies Metadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <Script
          defer
          data-domain="games.tokia.dev"
          src="https://ingest.tokia.dev/js/script.js"
        />
        {children}
      </body>
    </html>
  );
}
