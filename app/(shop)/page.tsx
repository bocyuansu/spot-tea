import { getSession } from '@/lib/session';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-96 flex flex-col justify-center items-center gap-4">
      <h1 className="text-5xl md:text-6xl">首頁 (開發中)</h1>
      {session ? <h2 className="text-5xl md:text-6xl">Hello , {session.user.name}</h2> : null}
    </div>
  );
}
