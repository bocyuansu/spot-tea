import Image from 'next/image';
import Link from 'next/link';

// 登入 / 註冊維持乾淨排版：沒有導覽列與 Footer，只有置中的表單。
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col justify-center items-center gap-6 p-4">
      <Link href="/" prefetch={false} className="flex items-center">
        <Image
          src="https://ik.imagekit.io/cyuan/spot-tea.jpg"
          alt="Spot Tea logo"
          width={100}
          height={100}
        />
      </Link>
      {children}
    </div>
  );
}
