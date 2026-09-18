import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// (shop)、(user) 與 not-found 共用的前台外框。因為 (auth)、(admin) 不要導覽列，
// 這層就不能留在 app/layout.tsx，只好抽成元件讓需要的地方自己包。
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-7xl">
        {children}
      </main>
      <Footer />
    </>
  );
}
