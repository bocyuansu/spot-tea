"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Link = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  links: Link[];
};

export default function MobileMenu({ links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 打開選單時，禁止背景捲動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div>
      <Button
        variant="link"
        aria-label="切換選單"
        className="border-0 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      <ul
        className={cn(
          "md:hidden h-screen fixed top-full left-0 w-full bg-primary p-4 space-y-4 flex flex-col items-center z-10 shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {links.map((link) => (
          <li key={link.label} className="w-full flex text-center">
            <Link
              href={link.href}
              className="flex-1 text-white hover:text-green-500"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}

        <li className="w-full flex text-center">
          <Link
            href="/cart"
            className="flex-1 text-white hover:text-green-500"
            onClick={() => setIsOpen(false)}
          >
            購物車
          </Link>
        </li>
      </ul>
    </div>
  );
}
