import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "./Nav";

export const metadata: Metadata = {
  title: "3D 植物園",
  description: "React Three Fiber で作った花の標本",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f19",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Nav />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
