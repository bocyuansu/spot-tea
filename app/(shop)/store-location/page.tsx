import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import OpeningHours from '@/components/common/OpeningHours';
import { STORE_EMAIL, STORE_PHONE } from '@/lib/store-info';

// 白底上的連結用深茶綠加底線，對比約 6:1
const linkClassName = 'text-primary-strong underline underline-offset-4';

export const metadata: Metadata = {
  title: '門市資訊',
  description: '找茶 門市資訊',
};

export default function StoreLocationPage() {
  return (
    <section className="flex flex-col justify-center gap-8 p-4">
      <div className="flex flex-col gap-8 xl:flex-row xl:gap-0">
        {/* LEFT */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="https://br-crimson-cake-b3f0h3r9.storage.c-4.ap-southeast-1.aws.neon.tech/images/public/spot-tea-store.jpg"
            alt="找茶台中實體門市"
            width={600}
            // 少了 height 瀏覽器拿不到固有比例，圖片載入時整塊會跳動
            height={338}
            className="aspect-video object-contain"
            unoptimized
          />
        </div>
        {/* RIGHT */}
        <div className="flex-1 flex flex-col gap-6 justify-center items-center text-center">
          <h1 className="text-2xl">台中實體門市</h1>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-lg">營業時間</h2>
            <OpeningHours className="text-left" />
          </div>
          <div>
            <h2 className="text-lg">門市電話</h2>
            <a href={STORE_PHONE.href} className={linkClassName}>
              {STORE_PHONE.display}
            </a>
          </div>
          <div>
            <h2 className="text-lg">聯繫我們</h2>
            <p>
              LINE｜
              <Link
                href="https://line.me/R/ti/p/@737drhqn"
                className={linkClassName}
              >
                @Spot-tea
              </Link>
            </p>
            <p>
              Instagram｜
              <Link
                href="https://www.instagram.com/spottea_tw"
                className={linkClassName}
              >
                spottea_tw
              </Link>
            </p>
            <p>
              Facebook｜
              <Link
                href="https://www.facebook.com/SpotTeaTW"
                className={linkClassName}
              >
                找茶．歡迎來Tea館！
              </Link>
            </p>
            <p>
              Email｜
              <Link href={`mailto:${STORE_EMAIL}`} className={linkClassName}>
                {STORE_EMAIL}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3640.0333890249076!2d120.6637915759063!3d24.170561772515367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346917d0c105863d%3A0xc64bd774162e5fcd!2z5om-6Iy2U3BvdFRlYQ!5e0!3m2!1szh-TW!2stw!4v1789565895328!5m2!1szh-TW!2stw"
        title="找茶"
        width="100%"
        height="450px"
        className="border-0 mx-auto"
        style={{ border: '0' }}
        loading="lazy"
      />
    </section>
  );
}
