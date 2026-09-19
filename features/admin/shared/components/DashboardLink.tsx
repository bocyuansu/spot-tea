import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardLink() {
  return (
    <Link
      href="/admin/dashboard"
      aria-label="後台"
      prefetch={false}
      className="text-xs sm:text-sm md:text-base p-1"
    >
      <Badge variant="default" className="hidden lg:inline hover:bg-primary/80">
        Dashboard
      </Badge>
    </Link>
  );
}
