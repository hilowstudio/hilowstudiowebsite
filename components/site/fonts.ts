import { Instrument_Serif, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";

// next/font downloads these at build time and serves them from this site,
// so visitors' browsers never contact Google Fonts.
export const display = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    display: "swap",
    variable: "--hl-font-display",
});

export const sans = Instrument_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--hl-font-sans",
});

export const mono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    display: "swap",
    variable: "--hl-font-mono",
});

export const fontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
