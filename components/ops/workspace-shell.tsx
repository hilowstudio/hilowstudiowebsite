"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Workspace = {
  id: string;
  slug: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
};

export function WorkspaceShell({
  children,
  workspace,
  canManage,
  userName,
}: {
  children: React.ReactNode;
  workspace: Workspace;
  canManage: boolean;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      href: `/w/${workspace.slug}`,
      label: "Dashboard",
      match: "exact" as const,
    },
    {
      href: `/w/${workspace.slug}/pipeline`,
      label: "Pipeline",
      match: "prefix" as const,
    },
    {
      href: `/w/${workspace.slug}/alerts`,
      label: "Signals",
      match: "prefix" as const,
    },
    {
      href: `/w/${workspace.slug}/clients`,
      label: "Clients",
      match: "prefix" as const,
    },
    {
      href: `/w/${workspace.slug}/network`,
      label: "Network",
      match: "prefix" as const,
    },
    {
      href: `/w/${workspace.slug}/content`,
      label: "Content",
      match: "prefix" as const,
    },
    {
      href: `/w/${workspace.slug}/usage`,
      label: "Usage",
      match: "prefix" as const,
    },
    ...(canManage
      ? [
          {
            href: `/w/${workspace.slug}/settings`,
            label: "Settings",
            match: "prefix" as const,
          },
        ]
      : []),
  ];

  async function handleLogout() {
    await fetch("/api/ops/auth/logout", { method: "POST" });
    router.push("/app/login");
  }

  const brandLabel = workspace.brand_name || workspace.name;
  const primary = workspace.primary_color || "var(--color-clay)";

  return (
    <div
      className="min-h-screen bg-paper"
      style={{ ["--ws-primary" as string]: primary } as React.CSSProperties}
    >
      <nav className="border-b border-paper-muted">
        <div className="px-6 pt-4 pb-2 text-center relative">
          <div className="flex items-center justify-center gap-3">
            {workspace.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workspace.logo_url}
                alt=""
                className="h-6 w-auto"
                aria-hidden
              />
            )}
            <span className="font-serif text-lg text-ink">{brandLabel}</span>
          </div>
          <div className="absolute right-6 top-4 flex items-center gap-4 text-sm">
            <Link
              href="/app"
              className="text-ink-light hover:text-ink transition-colors"
            >
              All workspaces
            </Link>
            <button
              onClick={handleLogout}
              className="text-ink-light hover:text-ink transition-colors"
            >
              Sign out ({userName})
            </button>
          </div>
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
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
