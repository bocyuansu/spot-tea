import Image from 'next/image';
import Link from 'next/link';
import OpeningHours from '@/components/common/OpeningHours';
import { STORE_EMAIL, STORE_PHONE } from '@/lib/store-info';

export default function Footer() {
  return (
    <footer className="site-container mt-16">
      <div className="flex flex-col items-center gap-12 rounded-lg md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-0 md:gap-y-10">
        <div className="flex flex-col items-center md:items-start md:w-1/3 lg:w-1/6">
          <Link href="/" prefetch={false} className="flex items-center">
            <Image
              src="https://ik.imagekit.io/cyuan/public/spot-tea.jpg"
              alt="找茶 首頁"
              width={100}
              height={100}
              crossOrigin="anonymous"
            />
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm items-center md:items-start md:w-1/3 lg:w-1/6">
          <h2 className="text-lg">關於我們</h2>
          <div className="flex flex-col gap-1">
            <Link href="/store-location" prefetch={false}>
              門市資訊
            </Link>
            <Link href="/" prefetch={false}>
              隱私權政策
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm items-center md:items-start md:w-1/3 lg:w-1/6">
          <h2 className="text-lg">顧客服務</h2>
          <div className="flex flex-col gap-1">
            <Link href="/" prefetch={false}>
              常見問題
            </Link>
            <Link href="/" prefetch={false}>
              購物須知
            </Link>
            <Link href="/" prefetch={false}>
              退換貨說明
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm items-center md:items-start md:w-2/3 lg:w-1/4">
          <h2 className="text-lg">聯絡我們</h2>
          <div className="flex flex-col gap-1">
            <p>
              電子信箱：
              <a
                href={`mailto:${STORE_EMAIL}`}
                className="underline-offset-4 hover:underline"
              >
                {STORE_EMAIL}
              </a>
            </p>
            <p>
              聯絡電話：
              <a
                href={STORE_PHONE.href}
                className="underline-offset-4 hover:underline"
              >
                {STORE_PHONE.display}
              </a>
            </p>
            <p>聯絡地址：臺中市華美西街二段311號13樓之2</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm items-center md:items-start md:w-1/3 lg:w-1/4">
          <h2 className="text-lg">營業時間</h2>
          <OpeningHours />
        </div>
      </div>
    </footer>
  );
}
