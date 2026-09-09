import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '韻文時空館｜詞館互動學習',
  description:
    '沿著時間理解詞的由來、詞牌、別稱、類別與風格，再完成自己的填詞作品。',
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
