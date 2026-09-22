import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-35" />
        <Skeleton className="h-6 w-55" />
      </div>

      <Skeleton className="h-7 w-90" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        {Array.from({ length: 4 }, (_, row) => (
          <Skeleton key={row} className="h-100 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
