import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '門市資訊',
  description: '找茶 門市資訊',
};

export default function StoreLocationPage() {
  return (
    <div className="min-h-96 flex justify-center items-center">
      <h1 className="text-5xl md:text-6xl">門市資訊（開發中）</h1>
    </div>
  );
}
