import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '韻文時空館｜國中國文互動學習',
  description: '沿著韻文時間軸，以觀察、操作與比較理解近體詩、詞等古典韻文。',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
