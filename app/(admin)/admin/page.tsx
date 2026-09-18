import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '後台儀表板',
};

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">儀表板</h1>
        <p className="mt-1 text-muted-foreground">營運數據總覽（開發中）</p>
      </div>
    </div>
  );
}
