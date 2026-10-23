# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Developers, designers, event organizers, and everyday creators needing customized, high-precision QR codes with instant feedback, zero sign-up, and complete offline privacy.

## Product Purpose
A client-side, high-performance QR code studio that allows users to generate, style (rounded corners, dot styles, foreground/background palette, transparent backdrop), customize with center emojis or typography, and export crisp vector SVG or high-resolution PNG QR codes without sending data to any external server.

## Positioning
An industrial-grade, essentialist utility that marries precision QR code generation with Monolith UI principles (strict 0px structural geometry, utilitarian monospace & sans typography, sharp 1px borders, zero unnecessary fluff, instantaneous <150ms transitions).

## Operating Context
Quick generation sessions on desktop or mobile browsers, offline PWA usage, sharing styled QR configurations via URL fragments, and rapid asset exports for print, digital signage, badges, and marketing collateral.

## Capabilities and Constraints
- Completely offline and client-side (no data upload).
- Real-time live preview with automated readability contrast & scanning viability checker.
- Full customization: Data text/URL, error correction levels (L, M, Q, H), dot patterns, margin, corner radius, color hex pickers, transparency, and center emoji/text embedding.
- Export formats: SVG and PNG.
- Configuration sharing via URL hash (`lz-string`).
- Local storage history for quick retrieval.
- Strict multilingual SSR/SSG support (JA, EN, ZH, ES).

## Brand Commitments
- MANPUC signature aesthetic: Monolith UI (strict 0px geometry for structural cards/inputs/buttons, 1px borders, monochromatic default idle states, fluid typography, subtle floating meta-actions, snappy 150ms transitions).
- Consistent MANPUC universal footer & navigation pattern (identical to char.manpuc.me).

## Evidence on Hand
- Design system specification from `https://ui.manpuc.me/llms.txt`.
- Sibling application reference at `E:\kuki\Documents\.Dev\char.manpuc.me`.
- Existing feature set in `src/pages/[...lang].astro`, `src/scripts/main.ts`, and `src/scripts/store.ts`.

## Product Principles
1. **Essentialist Utility**: Strip all superfluous ornament, glassmorphism blur, and soft puffy radii. Maximize scannability and density.
2. **Sharp & Rigorous Geometry**: 0px radius for structural elements (cards, containers, inputs, rectangular buttons) paired with strict 1px borders. Extreme contrast with 9999px pill/circular floating utility actions only where semantically appropriate.
3. **Frictionless & Responsive**: Real-time updates without lag, instant export, and streamlined configuration grouping.
4. **Privacy & Offline First**: Zero tracking of input content; PWA compliant.
