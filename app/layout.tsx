import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const galmuri = localFont({
  src: "../public/fonts/Galmuri11.ttf",
  variable: "--font-galmuri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Congratulations Seungseop!",
  description: "Graduation Celebration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${galmuri.variable} antialiased font-galmuri`}
      >
        {children}
      </body>
    </html>
  );
}
