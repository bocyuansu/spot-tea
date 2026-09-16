import Image from "next/image";
import Link from "next/link";
import ActiveLink from "@/components/ActiveLink";
import AuthButton from "@/features/auth/components/AuthButton";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";

// products?category=xxx
const links = [
  {
    href: "/products",
    label: "所有商品",
  },
  {
    href: "/brand-story",
    label: "品牌故事",
  },
  {
    href: "/store-location",
    label: "門市資訊",
  },
  {
    href: "/notices",
    label: "重要公告",
  },
];

export default async function Navbar() {
  const auth = createAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b">
      <div
        className={cn(
          "flex items-center mx-auto gap-2 p-4",
          "sm:gap-4 sm:px-0 sm:max-w-xl",
          "md:max-w-2xl md:gap-8",
          "lg:max-w-3xl xl:max-w-7xl",
        )}
      >
        {/* LEFT */}
        <Link href="/" className="hidden sm:flex items-center">
          <Image
            src="/assets/spot-tea.jpg"
            alt="Spot Tea logo"
            width={100}
            height={100}
            className="w-16 h-16 md:w-25 md:h-25"
          />
        </Link>
        <ul className="flex">
          {links.map((link) => (
            <li key={link.label}>
              <ActiveLink
                href={link.href}
                className="hover:text-primary"
                activeClassName="text-primary font-semibold"
              >
                {link.label}
              </ActiveLink>
            </li>
          ))}
        </ul>
        {/* RIGHT */}
        <div className="flex items-center ml-auto">
          <AuthButton initialSession={session} />
        </div>
      </div>
    </nav>
  );
}
