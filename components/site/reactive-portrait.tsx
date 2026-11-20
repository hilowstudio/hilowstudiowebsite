"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const SILLY = ["/site/adam-silly-1.webp", "/site/adam-silly-2.webp", "/site/adam-silly-3.webp", "/site/adam-silly-4.webp"];
const SIZES = "(max-width: 900px) 100vw, 480px";

/**
 * Adam's portrait. Hover (mouse) or press (touch, pen, mouse) shows one of four
 * silly versions at random; leaving or releasing snaps back to the original.
 * All five images load up front so the swap is instant. Purely decorative: the
 * portrait's alt text never changes, and the silly frames are hidden from
 * assistive tech.
 */
export function ReactivePortrait() {
    const [silly, setSilly] = useState<number | null>(null);
    const last = useRef<number | null>(null);

    function show() {
        let next = Math.floor(Math.random() * SILLY.length);
        if (SILLY.length > 1 && next === last.current) next = (next + 1) % SILLY.length;
        last.current = next;
        setSilly(next);
    }
    function hide() {
        setSilly(null);
    }

    return (
        <div
            className="hl-portrait"
            data-reactive
            onPointerEnter={(e) => e.pointerType === "mouse" && show()}
            onPointerLeave={hide}
            onPointerDown={(e) => e.pointerType !== "mouse" && show()}
            onPointerUp={(e) => e.pointerType !== "mouse" && hide()}
            onPointerCancel={hide}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="hl-portrait-crop">
                <Image
                    src="/site/adam.webp"
                    alt="Adam Vega, chin in hand, in glasses and a red cap"
                    fill
                    sizes={SIZES}
                    priority
                    draggable={false}
                />
                {SILLY.map((src, i) => (
                    <Image
                        key={src}
                        src={src}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes={SIZES}
                        draggable={false}
                        data-on={silly === i ? "true" : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
