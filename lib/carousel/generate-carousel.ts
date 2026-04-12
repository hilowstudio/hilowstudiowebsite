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
import type { CarouselSlide } from "./slides-from-post";
import path from "path";

// ─── Register EB Garamond (serif, closest free Garamond) ──
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

// Disable hyphenation for clean word wrapping
Font.registerHyphenationCallback((word) => [word]);

// ─── Brand tokens (hex equivalents of oklch from globals.css) ─────
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

// Logo path (resolved at build time from public/)
const logoPath = path.join(process.cwd(), "public", "hilow.png");

// ─── Styles (1080x1080 square, 1.25 Major Third, 4px rhythm) ─────

const styles = StyleSheet.create({
  // ── Content slides (paper background) ──
  page: {
    width: 1080,
    height: 1080,
    backgroundColor: brand.paper,
    padding: 96,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heading: {
    fontFamily: "Garamond",
    fontSize: 44,
    fontWeight: "bold",
    color: brand.ink,
    marginBottom: 32,
    lineHeight: 1.2,
  },
  body: {
    fontFamily: "Garamond",
    fontSize: 28,
    color: brand.inkMuted,
    lineHeight: 1.6,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: brand.clay,
  },
  logo: {
    position: "absolute",
    top: 40,
    right: 48,
    width: 56,
    height: 56,
    opacity: 0.7,
  },
  logoBackdrop: {
    position: "absolute",
    top: 32,
    right: 40,
    width: 72,
    height: 72,
    backgroundColor: brand.paper,
    borderRadius: 8,
    opacity: 0.9,
  },
  slideNumber: {
    position: "absolute",
    bottom: 48,
    right: 64,
    fontFamily: "Garamond",
    fontSize: 16,
    color: brand.inkLight,
    letterSpacing: 1,
  },
  divider: {
    width: 64,
    height: 3,
    backgroundColor: brand.clayMuted,
    marginBottom: 28,
    borderRadius: 2,
  },

  // ── Title slide (first, ink background) ──
  titlePage: {
    width: 1080,
    height: 1080,
    backgroundColor: brand.ink,
    padding: 96,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  titleHeading: {
    fontFamily: "Garamond",
    fontSize: 55,
    fontWeight: "bold",
    color: brand.paper,
    lineHeight: 1.2,
    marginBottom: 32,
  },
  titleDivider: {
    width: 64,
    height: 3,
    backgroundColor: brand.moss,
    marginBottom: 28,
    borderRadius: 2,
  },
  titleBody: {
    fontFamily: "Garamond",
    fontSize: 28,
    color: brand.paperMuted,
    lineHeight: 1.6,
  },
  titleAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: brand.moss,
  },

  // ── CTA slide (last, ink background, centered) ──
  ctaPage: {
    width: 1080,
    height: 1080,
    backgroundColor: brand.ink,
    padding: 96,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaHeading: {
    fontFamily: "Garamond",
    fontSize: 48,
    fontWeight: "bold",
    color: brand.paper,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 1.2,
  },
  ctaBody: {
    fontFamily: "Garamond",
    fontSize: 28,
    color: brand.paperMuted,
    textAlign: "center",
    lineHeight: 1.6,
  },
  ctaDivider: {
    width: 80,
    height: 3,
    backgroundColor: brand.clay,
    marginBottom: 28,
    borderRadius: 2,
  },
  ctaAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: brand.terracotta,
  },
});

function CarouselDocument({ slides }: { slides: CarouselSlide[] }) {
  const isLastSlideCta =
    slides.length > 1 &&
    /follow|connect|subscribe|learn more|link|comment/i.test(
      slides[slides.length - 1].heading +
        " " +
        slides[slides.length - 1].body
    );

  return React.createElement(
    Document,
    null,
    slides.map((slide, i) => {
      const isFirst = i === 0;
      const isLast = i === slides.length - 1;
      const isCta = isLast && isLastSlideCta;

      // Title slide
      if (isFirst) {
        return React.createElement(
          Page,
          { key: i, size: [1080, 1080], style: styles.titlePage },
          React.createElement(View, { style: styles.titleAccentBar }),
          React.createElement(View, { style: styles.logoBackdrop }),
          React.createElement(Image, { src: logoPath, style: styles.logo }),
          React.createElement(
            Text,
            { style: styles.titleHeading },
            slide.heading
          ),
          React.createElement(View, { style: styles.titleDivider }),
          React.createElement(
            Text,
            { style: styles.titleBody },
            slide.body
          ),
          React.createElement(
            Text,
            { style: styles.slideNumber },
            `${i + 1} / ${slides.length}`
          )
        );
      }

      // CTA slide
      if (isCta) {
        return React.createElement(
          Page,
          { key: i, size: [1080, 1080], style: styles.ctaPage },
          React.createElement(View, { style: styles.ctaAccentBar }),
          React.createElement(View, { style: styles.logoBackdrop }),
          React.createElement(Image, { src: logoPath, style: styles.logo }),
          React.createElement(
            Text,
            { style: styles.ctaHeading },
            slide.heading
          ),
          React.createElement(View, { style: styles.ctaDivider }),
          React.createElement(
            Text,
            { style: styles.ctaBody },
            slide.body
          ),
          React.createElement(
            Text,
            { style: styles.slideNumber },
            `${i + 1} / ${slides.length}`
          )
        );
      }

      // Content slides
      return React.createElement(
        Page,
        { key: i, size: [1080, 1080], style: styles.page },
        React.createElement(View, { style: styles.accentBar }),
        React.createElement(Image, { src: logoPath, style: styles.logo }),
        React.createElement(
          Text,
          { style: styles.heading },
          slide.heading
        ),
        React.createElement(View, { style: styles.divider }),
        React.createElement(Text, { style: styles.body }, slide.body),
        React.createElement(
          Text,
          { style: styles.slideNumber },
          `${i + 1} / ${slides.length}`
        )
      );
    })
  );
}

export async function generateCarouselPdf(
  slides: CarouselSlide[]
): Promise<Buffer> {
  const doc = React.createElement(CarouselDocument, { slides });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}
