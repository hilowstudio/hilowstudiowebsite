// Which paths belong to the apps that share this Next.js project.
// The public site (everything else) draws its own header and footer in
// components/site. The apps keep the original header, unchanged.
export const APP_PREFIXES = ["/admin", "/studio", "/w", "/c", "/p", "/app", "/login"] as const;

export function isAppPath(pathname: string | null | undefined): boolean {
    if (!pathname) return false;
    return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
