import type { Metadata } from "next";
import { Righteous, Josefin_Sans } from "next/font/google";
import "./globals.css";

const righteous = Righteous({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-righteous',
});

const josefinSans = Josefin_Sans({ 
  subsets: ["latin"],
  variable: '--font-josefin',
});

export const metadata: Metadata = {
  title: "CineSpin - Your Movie Finder",
  description: "Travel back in time and discover your next favorite movie with CineSpin",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${righteous.variable} ${josefinSans.variable}`}>
      <body className="bg-[#1a1a1a] min-h-screen font-josefin">
        {children}
      </body>
    </html>
  );
}
