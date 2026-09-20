import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="site-container p-4">{children}</main>
      <Footer />
    </>
  );
}
