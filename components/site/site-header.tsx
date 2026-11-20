"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
    { href: "/#products", label: "Products", match: ["/", "/exegetica", "/quillandcompass", "/podcatch", "/hilowbrowser"] },
    { href: "/standards", label: "Standards", match: ["/standards"] },
    { href: "/services", label: "Services", match: ["/services", "/book"] },
    { href: "/about", label: "About", match: ["/about"] },
];

function current(pathname: string, match: string[]): boolean {
    return match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)));
}

export function SiteHeader() {
    const pathname = usePathname() || "/";
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const items = links.map((l) => (
        <li key={l.href}>
            <Link href={l.href} aria-current={current(pathname, l.match) ? "page" : undefined}>
                {l.label}
            </Link>
        </li>
    ));

    return (
        <header className="hl-top">
            <a className="hl-skip" href="#main">
                Skip to content
            </a>
            <div className="hl-wrap">
                <Link className="hl-brand" href="/">
                    <Image src="/site/mark.png" alt="" width={480} height={346} priority />
                    <span>Hi Low Studio</span>
                </Link>
                <nav aria-label="Main">
                    <ul className="hl-nav">{items}</ul>
                </nav>
                <button
                    type="button"
                    className="hl-menu-btn"
                    aria-expanded={open}
                    aria-controls="hl-sheet"
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? "Close" : "Menu"}
                </button>
            </div>
            <div id="hl-sheet" className="hl-sheet" data-open={open}>
                <nav aria-label="Main, small screens" className="hl-wrap">
                    <ul>{items}</ul>
                </nav>
            </div>
        </header>
    );
}
