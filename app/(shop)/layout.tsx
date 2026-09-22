import SiteChrome from '@/components/layout/SiteChrome';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
