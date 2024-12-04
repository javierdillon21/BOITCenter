"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavItem({
  href,
  children,
  defaultstyle,
}: {
  href: string;
  children: React.ReactNode;
  defaultstyle?: boolean;
}) {
  const pathname = usePathname();


  if (defaultstyle)
    return (
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 rounded-xl  px-3 py-2 text-gray-900 hover:bg-gray-200  transition-all hover:text-gray-900  dark:text-gray-50 dark:hover:text-gray-50",
          {
            "bg-gray-100 dark:bg-gray-800": pathname === href,
          }
        )}
      >
        {children}
      </Link>
    );
  else
    return (
      <Link href={href}>
        <li
          className={`${
            pathname === href ? "flex bg-gray-200 rounded-xl dark:bg-gray-800" : ""
          }`}
        >
          <p>{children}</p>
        </li>
      </Link>
    );
}
