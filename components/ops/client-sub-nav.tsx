"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClientSubNav({
  workspaceSlug,
  clientSlug,
}: {
  workspaceSlug: string;
  clientSlug: string;
}) {
  const pathname = usePathname();
  const base = `/w/${workspaceSlug}/c/${clientSlug}`;
  const items = [
    { href: base, label: "Overview", match: "exact" as const },
    { href: `${base}/meetings`, label: "Meetings", match: "prefix" as const },
    { href: `${base}/briefs`, label: "Briefs", match: "prefix" as const },
    {
      href: `${base}/testimonials`,
      label: "Testimonials",
      match: "prefix" as const,
    },
    { href: `${base}/content`, label: "Content", match: "prefix" as const },
    {
      href: `${base}/integrations`,
      label: "Integrations",
      match: "prefix" as const,
    },
  ];

  return (
    <nav className="flex gap-1 border-b border-paper-muted -mx-1">
      {items.map((item) => {
        const isActive =
          item.match === "exact"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm transition-colors border-b-2 ${
              isActive
                ? "font-medium"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
            style={
              isActive
                ? {
                    borderBottomColor: "var(--ws-primary)",
                    color: "var(--ws-primary)",
                  }
                : undefined
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
