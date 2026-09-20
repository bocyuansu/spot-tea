import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SITE_CONTAINER } from '@/lib/site-container';
import { cn } from '@/lib/utils';

// (shop)、(user) 與 not-found 共用的前台外框。因為 (auth)、(admin) 不要導覽列，
// 這層就不能留在 app/layout.tsx，只好抽成元件讓需要的地方自己包。
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className={cn(SITE_CONTAINER, 'p-4')}>{children}</main>
      <Footer />
    </>
  );
}
