import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const serif = EB_Garamond({
    variable: "--font-serif",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600"],
});

const sans = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Hi Low Studio | Digital Supports for Analog Living",
        template: "%s | Hi Low Studio",
    },
    description:
        "We build calm tech for the sovereign individual. Utility-first software designed to solve problems, then get out of your way.",
    keywords: ["calm tech", "post-institutional", "homeschool software", "death care", "sovereign individual", "data sovereignty"],
    authors: [{ name: "Hi Low Studio" }],
    creator: "Hi Low Studio",
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Hi Low Studio",
        title: "Hi Low Studio | Digital Supports for Analog Living",
        description: "We build calm tech for the sovereign individual.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Hi Low Studio",
        description: "Digital Supports for Analog Living",
    },
    icons: {
        icon: "/hilow.png",
        apple: "/hilow.png",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <Header />
                {children}
            </body>
        </html>
    );
}
