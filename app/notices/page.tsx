import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '重要公告',
  description: '找茶 重要公告',
};

export default function NoticesPage() {
  return (
    <div className="min-h-96 flex justify-center items-center">
      <h1 className="text-5xl md:text-6xl">重要公告（開發中）</h1>
    </div>
  );
}
