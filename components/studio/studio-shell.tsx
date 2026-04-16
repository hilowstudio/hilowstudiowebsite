"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/studio", label: "Home", match: "exact" as const },
  { href: "/studio/projects", label: "Projects", match: "prefix" as const },
  { href: "/studio/clients", label: "Clients", match: "prefix" as const },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-paper-muted">
        <div className="px-6 pt-4 pb-2 text-center relative">
          <span className="font-serif text-lg text-ink">Studio</span>
          <button
            onClick={handleLogout}
            className="absolute right-6 top-4 text-sm text-ink-light hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </div>
        <div className="flex justify-center -mb-px">
          {navItems.map((item) => {
            const isActive =
              item.match === "exact"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2.5 text-sm transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-clay text-clay font-medium"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-clay-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="p-6 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
