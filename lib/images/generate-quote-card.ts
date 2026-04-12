import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import path from "path";

// Reuse the same font registration (idempotent if already registered)
Font.register({
  family: "Garamond",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/ebgaramond/v32/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RUAw.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/ebgaramond/v32/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-DPNUAw.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://fonts.gstatic.com/s/ebgaramond/v32/SlGFmQSNjdsmc35JDF1K5GRwUjcdlttVFm-rI7e8QI96.ttf",
      fontStyle: "italic",
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const brand = {
  paper: "#F9F6F1",
  paperWarm: "#EFE9DF",
  paperMuted: "#E5E0D8",
  ink: "#292524",
  inkMuted: "#57534E",
  inkLight: "#78716C",
  clay: "#9A6B4A",
  clayMuted: "#B08E74",
  moss: "#4A7252",
  terracotta: "#B05A3C",
};

const logoPath = path.join(process.cwd(), "public", "hilow.png");

// LinkedIn recommended post image: 1200x627 (1.91:1)
const WIDTH = 1200;
const HEIGHT = 627;

const styles = StyleSheet.create({
  // ── Paper background variant ──
  pagePaper: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: brand.paper,
    padding: 64,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  // ── Ink background variant ──
  pageInk: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: brand.ink,
    padding: 64,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  accentBarClay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: brand.clay,
  },
  accentBarMoss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: brand.moss,
  },
  logo: {
    position: "absolute",
    bottom: 32,
    right: 40,
    width: 44,
    height: 44,
    opacity: 0.6,
  },
  // Paper variant text
  quotePaper: {
    fontFamily: "Garamond",
    fontSize: 36,
    fontStyle: "italic",
    color: brand.ink,
    lineHeight: 1.5,
    marginBottom: 24,
  },
  attributionPaper: {
    fontFamily: "Garamond",
    fontSize: 18,
    color: brand.inkLight,
    lineHeight: 1.4,
  },
  dividerPaper: {
    width: 56,
    height: 3,
    backgroundColor: brand.clayMuted,
    marginBottom: 20,
    borderRadius: 2,
  },
  // Ink variant text
  quoteInk: {
    fontFamily: "Garamond",
    fontSize: 36,
    fontStyle: "italic",
    color: brand.paper,
    lineHeight: 1.5,
    marginBottom: 24,
  },
  attributionInk: {
    fontFamily: "Garamond",
    fontSize: 18,
    color: brand.paperMuted,
    lineHeight: 1.4,
  },
  dividerInk: {
    width: 56,
    height: 3,
    backgroundColor: brand.clay,
    marginBottom: 20,
    borderRadius: 2,
  },
});

export type QuoteCardVariant = "paper" | "ink";

interface QuoteCardProps {
  quote: string;
  attribution?: string;
  variant?: QuoteCardVariant;
}

function QuoteCardDocument({
  quote,
  attribution,
  variant = "paper",
}: QuoteCardProps) {
  const isPaper = variant === "paper";

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      {
        size: [WIDTH, HEIGHT],
        style: isPaper ? styles.pagePaper : styles.pageInk,
      },
      React.createElement(
        View,
        { style: isPaper ? styles.accentBarClay : styles.accentBarMoss }
      ),
      React.createElement(Image, { src: logoPath, style: styles.logo }),
      React.createElement(
        Text,
        { style: isPaper ? styles.quotePaper : styles.quoteInk },
        `"${quote}"`
      ),
      React.createElement(
        View,
        { style: isPaper ? styles.dividerPaper : styles.dividerInk }
      ),
      attribution
        ? React.createElement(
            Text,
            {
              style: isPaper
                ? styles.attributionPaper
                : styles.attributionInk,
            },
            attribution
          )
        : null
    )
  );
}

export async function generateQuoteCard(
  quote: string,
  attribution?: string,
  variant: QuoteCardVariant = "paper"
): Promise<Buffer> {
  const doc = React.createElement(QuoteCardDocument, {
    quote,
    attribution,
    variant,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}
