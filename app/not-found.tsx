import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>找不到此頁面</p>
      <Link href="/">回首頁</Link>
    </div>
  );
}
