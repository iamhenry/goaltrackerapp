import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { Header } from "@/app/components/Header";

const karla = Karla({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goal Tracker",
  description: "Baby steps to completing your goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <script
        src="https://beamanalytics.b-cdn.net/beam.min.js"
        data-token="25f94ca0-d8d0-4909-8882-9fbdac847a2b"
        async
      ></script>
      <body className={karla.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
