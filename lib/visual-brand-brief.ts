/**
 * Visual Brand Brief for Hi-Low Studio
 *
 * Derived from:
 * - PERSONA_SYSTEM_PROMPT (the Calm Integrator voice)
 * - .agent/rules/user-interfaces.md (UI/UX design principles)
 * - app/globals.css (color tokens, typography scale, spacing rhythm)
 *
 * This brief is injected into image generation prompts so that AI-generated
 * visuals carry the same personality and aesthetic as the rest of the brand.
 */

export const VISUAL_BRAND_BRIEF = `## Hi-Low Studio Visual Brand Brief

### Brand Identity
Hi-Low Studio builds digital supports for analog living. The visual language
communicates calm, weight, and craft. Nothing screams. Nothing blinks. Every
image should feel like it belongs in a quiet, well-lit workshop, not a SaaS
marketing deck.

### Color Palette (strict)
All images must use only these tones. No neon. No saturated blues or purples.
No corporate gradients.

- **Paper (dominant, 60%):** Warm cream and off-white. Not pure white. Think
  aged stationery, linen, sun-bleached wood. Hex range: #F9F6F1 to #E5E0D8.
- **Ink (secondary, 30%):** Deep warm charcoal. Not pure black. Think cast iron,
  dark walnut, graphite on rough paper. Hex range: #292524 to #57534E.
- **Accent (10%, used sparingly):**
  - Clay: warm brown-orange, like terracotta pottery or dried river mud (#9A6B4A)
  - Moss: muted forest green, like lichen on stone (#4A7252)
  - Terracotta: deeper earth red, like kiln-fired brick (#B05A3C)

### Texture and Medium
- **Risograph / letterpress feel.** Slight grain, visible texture, like ink
  pressed into thick paper. Not smooth digital gradients.
- **Stipple and halftone dots** are welcome as background texture, like a
  newspaper printed on craft paper.
- **Hand-drawn imperfection.** Edges should feel slightly organic, not
  mathematically perfect. Rounded rectangles over sharp corners. Slight
  irregularity communicates "made by a human."
- **No glossy, no glass, no chrome.** Nothing that looks like a 3D render
  or a smartphone UI mockup.

### Composition
- **Minimalist.** Generous whitespace (or rather, "paper-space"). Let the
  subject breathe. Do not fill every corner.
- **Asymmetric balance.** Not perfectly centered. Offset compositions feel
  more natural and less corporate. Think editorial magazine layout.
- **Depth through shadow, not effects.** Subtle, warm shadows cast onto
  paper. No drop-shadow presets. No outer glow.

### Subject Matter and Metaphor
- **Analog objects as metaphors for digital concepts.** A compass for
  navigation. A scaffolding for support systems. A hand-drawn map for
  strategy. Stacked stones for balance. A workshop bench for building.
- **Human elements are abstracted.** Silhouettes, hands, gestures. Not
  photorealistic faces. The human is present but not performing.
- **Nature as grounding.** Wood grain, stone, moss, flowing water, root
  systems. These are not decorative. They represent the organic, living
  systems the brand cares about.
- **No corporate imagery.** No handshakes, no skyscrapers, no people
  pointing at whiteboards, no stock-photo smiles.

### Typography in Images
- **Serif headings (Garamond / EB Garamond).** Evokes history, institutions,
  the weight of ideas that have lasted.
- **Clean sans-serif for small labels** if needed, but prefer no text in
  illustrations. Let the image carry the concept.
- **If text appears, it must follow the voice rules:** no banned words,
  no em dashes, high burstiness, direct and warm.

### Emotional Register
The image should make the viewer feel:
- **Grounded.** Like sitting in a quiet room with good light.
- **Safe.** No urgency, no anxiety, no "ACT NOW" energy.
- **Curious.** There is something worth looking at more closely.
- **Respected.** The viewer's attention was not hijacked. It was invited.

### What to Avoid (absolute)
- Neon or saturated colors
- Corporate stock photo aesthetic
- Busy or cluttered compositions
- Glossy 3D renders
- Tech-bro visual language (rocket ships, brains with gears, lightbulbs)
- AI-slop tells: overly symmetric, plastic skin textures, nonsensical text
- Pure black or pure white backgrounds (always warm)`;
