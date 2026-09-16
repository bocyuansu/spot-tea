import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '品牌故事',
  description: '找茶 品牌故事',
};

export default function BrandStoryPage() {
  return (
    <div className="min-h-96 flex justify-center items-center">
      <h1 className="text-5xl md:text-6xl">品牌故事（開發中）</h1>
    </div>
  );
}
