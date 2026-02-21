import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { AdminProvider } from "@/context/AdminContext";

const notoTabsKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

const galmuri = localFont({
  src: "../public/fonts/Galmuri11.ttf",
  variable: "--font-galmuri",
  display: "swap",
});

const manseh = localFont({
  src: "../public/fonts/YoonChildfundkoreaManSeh.ttf",
  variable: "--font-manseh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "섭승이 대졸 프로젝트",
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
        className={`${galmuri.variable} ${notoTabsKr.variable} ${manseh.variable} antialiased font-galmuri`}
      >
        <AdminProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
