"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/contacts", label: "Pipeline" },
  { href: "/admin/content", label: "Content" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-paper-muted px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-serif text-lg text-ink">Hi Low Admin</span>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:text-ink hover:bg-paper-warm"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-ink-light hover:text-ink transition-colors"
        >
          Sign out
        </button>
      </nav>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
