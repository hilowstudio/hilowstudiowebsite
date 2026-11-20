import "./site.css";
import { fontVariables } from "./fonts";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
    return (
        <div className={`hl-site ${fontVariables}`}>
            <SiteHeader />
            <main id="main" tabIndex={-1}>
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
