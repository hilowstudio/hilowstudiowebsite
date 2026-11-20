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
        default: "Hi Low Studio | Digital supports for analog living",
        template: "%s | Hi Low Studio",
    },
    description:
        "Hi Low Studio makes small, calm software for study, school and focus, and builds AI, automation and web systems for the businesses it works with.",
    keywords: ["calm tech", "Bible study software", "Christian school software", "homeschool software", "attention", "data sovereignty"],
    authors: [{ name: "Hi Low Studio" }],
    creator: "Hi Low Studio",
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Hi Low Studio",
        title: "Hi Low Studio | Digital supports for analog living",
        description: "Small, calm software for study, school and focus.",
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
