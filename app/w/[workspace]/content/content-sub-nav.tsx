"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContentSubNav({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname();
  const base = `/w/${workspaceSlug}/content`;

  const items: { href: string; label: string; exact: boolean }[] = [
    { href: `${base}/voice`, label: "Voice", exact: false },
    { href: `${base}/sources`, label: "Source Material", exact: false },
    { href: base, label: "Content", exact: true },
    { href: `${base}/calendar`, label: "Calendar", exact: true },
    { href: `${base}/analytics`, label: "Analytics", exact: false },
  ];

  function isActive(item: { href: string; exact: boolean }) {
    if (item.exact) {
      if (pathname === item.href) return true;
      if (
        item.href === base &&
        (pathname.startsWith(`${base}/new`) ||
          /^\/w\/[^/]+\/content\/[^/]+$/.test(pathname) &&
            !pathname.endsWith("/voice") &&
            !pathname.endsWith("/sources") &&
            !pathname.endsWith("/calendar") &&
            !pathname.endsWith("/analytics"))
      ) {
        return true;
      }
      return false;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <nav className="flex justify-center border-b border-paper-muted -mb-px">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-5 py-2.5 text-sm transition-colors whitespace-nowrap border-b-2 ${
              active
                ? "border-clay text-clay font-medium"
                : "border-transparent text-ink-muted hover:text-ink hover:border-clay-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
