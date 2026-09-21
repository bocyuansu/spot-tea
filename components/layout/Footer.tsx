import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <div className="site-container mt-16">
      <div className="flex flex-col items-center gap-8 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-0 rounded-lg space-y-8">
        <div className="flex flex-col items-center md:items-start md:w-1/3 lg:w-1/6">
          <Link href="/" prefetch={false} className="flex items-center">
            <Image
              src="https://ik.imagekit.io/cyuan/products/spot-tea.jpg"
              alt="Spot Tea logo"
              width={100}
              height={100}
            />
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm items-center md:items-start md:w-1/3 lg:w-1/6">
          <p className="text-lg">關於我們</p>
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
          <p className="text-lg">顧客服務</p>
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
          <p className="text-lg">聯絡我們</p>
          <div className="flex flex-col gap-1">
            <p>電子信箱：spotteatw@gmail.com</p>
            <p>聯絡電話：0958565883</p>
            <p>聯絡地址：臺中市華美西街二段311號13樓之2</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm items-center md:items-start md:w-1/3 lg:w-1/4">
          <p className="text-lg">營業時間</p>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2">
              <span>星期一</span>
              <span>09:00 - 17:00</span>
            </div>
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2 lg:text-nowrap">
              <span>星期二</span>
              <span>09:00 - 12:00、16:00 - 24:00</span>
            </div>
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2">
              <span>星期三</span>
              <span>09:00 - 12:00</span>
            </div>
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2 lg:text-nowrap">
              <span>星期四</span>
              <span>09:00 - 12:00、16:00 - 24:00</span>
            </div>
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2">
              <span>星期五</span>
              <span>09:00 - 12:00</span>
            </div>
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2">
              <span>星期六</span>
              <span>13:00 - 24:00</span>
            </div>
            <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center lg:gap-2">
              <span>星期日</span>
              <span>13:00 - 24:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
