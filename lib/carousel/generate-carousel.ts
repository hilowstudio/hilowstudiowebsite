import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { CarouselSlide } from "./slides-from-post";

const styles = StyleSheet.create({
  page: {
    width: 1080,
    height: 1080,
    backgroundColor: "#FAF8F5", // paper
    padding: 80,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heading: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1C1917", // ink
    marginBottom: 32,
    lineHeight: 1.2,
  },
  body: {
    fontSize: 28,
    color: "#57534E", // ink-muted
    lineHeight: 1.5,
  },
  slideNumber: {
    position: "absolute",
    bottom: 40,
    right: 60,
    fontSize: 18,
    color: "#A8A29E", // ink-light
  },
  ctaPage: {
    width: 1080,
    height: 1080,
    backgroundColor: "#1C1917", // ink
    padding: 80,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaHeading: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FAF8F5", // paper
    textAlign: "center",
    marginBottom: 24,
  },
  ctaBody: {
    fontSize: 28,
    color: "#D6D3D1", // paper-muted
    textAlign: "center",
  },
});

function CarouselDocument({
  slides,
}: {
  slides: CarouselSlide[];
}) {
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
      const isLast = i === slides.length - 1;
      const isCta = isLast && isLastSlideCta;

      return React.createElement(
        Page,
        {
          key: i,
          size: [1080, 1080],
          style: isCta ? styles.ctaPage : styles.page,
        },
        React.createElement(
          Text,
          { style: isCta ? styles.ctaHeading : styles.heading },
          slide.heading
        ),
        React.createElement(
          Text,
          { style: isCta ? styles.ctaBody : styles.body },
          slide.body
        ),
        React.createElement(
          Text,
          { style: styles.slideNumber },
          `${i + 1}/${slides.length}`
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
