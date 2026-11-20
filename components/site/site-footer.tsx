import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
    return (
        <footer className="hl-foot">
            <div className="hl-wrap">
                <Image src="/site/lockup.png" alt="Hi Low Studio" width={397} height={480} />
                <p className="hl-money">
                    Hi Low Studio LLC is bootstrapped and paid for by consulting and product sales. We don’t sell
                    data or run ads.
                </p>
                <nav aria-label="Footer">
                    <ul>
                        <li>
                            <Link href="/contact">Contact</Link>
                        </li>
                        <li>
                            <Link href="/privacy">Privacy</Link>
                        </li>
                        <li>
                            <Link href="/changelog">Changelog</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
}
