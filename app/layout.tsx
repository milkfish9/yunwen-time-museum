import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '韻文時空館｜詞的由來與填詞工作室',
  description: '沿著韻文時間軸理解詞的由來，再抽詞牌、轉題目，完成自己的填詞作品。',
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
