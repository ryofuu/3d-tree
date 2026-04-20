import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "./Nav";

export const metadata: Metadata = {
  title: "3D 植物園",
  description: "React Three Fiber で作った木・花・幻想花の標本",
};

const mainStyle: React.CSSProperties = {
  position: "fixed",
  top: 52,
  left: 0,
  right: 0,
  bottom: 0,
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
        <main style={mainStyle}>{children}</main>
      </body>
    </html>
  );
}
