import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '韻文時空館｜動手探索詞的模具',
  description: '從韻文時間圖出發，操作文字格、填詞模具，完成你的詞作品鑑定。',
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
