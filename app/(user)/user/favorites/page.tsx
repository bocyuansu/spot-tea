import type { Metadata } from 'next';
import { getSession } from '@/lib/session';
import { listUserFavorites } from '@/db/queries/favorites';
import FavoriteList from '@/features/favorites/components/FavoriteList';
import SessionExpiredCard from '@/features/user/components/SessionExpiredCard';

export const metadata: Metadata = {
  title: '商品收藏',
  description: '找茶 商品收藏',
};

export default async function UserFavoritesPage() {
  const session = await getSession();

  if (!session) {
    return <SessionExpiredCard />;
  }

  const favorites = await listUserFavorites(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">商品收藏</h1>
        <p className="mt-1 text-muted-foreground">您收藏的茶品都在這裡</p>
      </div>

      <FavoriteList favorites={favorites} />
    </div>
  );
}
