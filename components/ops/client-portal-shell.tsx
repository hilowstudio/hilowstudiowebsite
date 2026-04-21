"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Client = { id: string; slug: string; name: string; company: string | null };
type Workspace = { brandName: string; logoUrl: string | null; primaryColor: string | null };

export function ClientPortalShell({
  children,
  client,
  workspaceBrand,
  userName,
}: {
  children: React.ReactNode;
  client: Client;
  workspaceBrand: Workspace;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const primary = workspaceBrand.primaryColor || "var(--color-clay)";

  const items = [
    { href: `/c/${client.slug}`, label: "Home", match: "exact" as const },
    {
      href: `/c/${client.slug}/meetings`,
      label: "Meetings",
      match: "prefix" as const,
    },
    {
      href: `/c/${client.slug}/content`,
      label: "Content",
      match: "prefix" as const,
    },
  ];

  async function handleLogout() {
    await fetch("/api/ops/auth/logout", { method: "POST" });
    router.push("/app/login");
  }

  return (
    <div
      className="min-h-screen bg-paper"
      style={{ ["--ws-primary" as string]: primary } as React.CSSProperties}
    >
      <nav className="border-b border-paper-muted">
        <div className="px-6 pt-4 pb-2 text-center relative">
          <div className="flex items-center justify-center gap-3">
            {workspaceBrand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workspaceBrand.logoUrl}
                alt=""
                className="h-6 w-auto"
                aria-hidden
              />
            )}
            <span className="font-serif text-lg text-ink">
              {workspaceBrand.brandName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="absolute right-6 top-4 text-sm text-ink-light hover:text-ink transition-colors"
          >
            Sign out ({userName})
          </button>
        </div>
        <div className="flex justify-center -mb-px">
          {items.map((item) => {
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
        </div>
      </nav>
      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <header>
          <p className="text-xs text-ink-muted uppercase tracking-wide">Workspace</p>
          <h1 className="font-serif text-2xl text-ink">{client.name}</h1>
          {client.company && (
            <p className="text-sm text-ink-light">{client.company}</p>
          )}
        </header>
        {children}
      </main>
    </div>
  );
}
