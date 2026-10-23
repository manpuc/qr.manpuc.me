---
name: QR Maker
description: Essentialist, borderless QR code studio directly modeled on char.manpuc.me and ui.manpuc.me Monolith standards
colors:
  primary: "#000000"
  neutral-bg: "#ffffff"
  neutral-fg: "#000000"
  border: "#e5e5e5"
  accent: "#f4f4f5"
  muted: "#f4f4f5"
  muted-foreground: "#71717a"
  dark-bg: "#000000"
  dark-fg: "#ffffff"
  dark-border: "#27272a"
  dark-accent: "#27272a"
  dark-muted: "#18181b"
  dark-muted-foreground: "#a1a1aa"
  success: "#16a34a"
  warning: "#d97706"
  danger: "#dc2626"
typography:
  display:
    fontFamily: '"Space Mono", monospace'
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  headline:
    fontFamily: '"Quicksand", sans-serif'
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  hero:
    fontFamily: '"Quicksand", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: '"Quicksand", sans-serif'
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: '"Space Mono", monospace'
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
  body:
    fontFamily: '"Quicksand", "Noto Sans JP", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  compact:
    fontFamily: '"Quicksand", "Noto Sans JP", sans-serif'
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: '"Space Mono", monospace'
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  micro:
    fontFamily: '"Space Mono", monospace'
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.08em"
  nano:
    fontFamily: '"Space Mono", monospace'
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.08em"
rounded:
  structural: "0px"
  micro: "2px"
  sm: "4px"
  md: "8px"
  qr-frame: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  pill-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
---

# Design System: QR Maker (char.manpuc.me / Monolith UI Alignment)

## Overview

**Creative North Star: "The Borderless Canvas"**

QR Maker directly adopts the visual philosophy of `char.manpuc.me`:
1. **Borderless by Default**: No heavy box outlines, grid borders, or arbitrary card containers enclosing the interface. Layout is organized via generous whitespace, typographic scale, and delicate subtle division lines.
2. **Hero Input**: Seamless, expansive textarea with transparent background and soft placeholder, identical to `char.manpuc.me`'s main writing canvas.
3. **Floating Meta-Actions**: Circular (48px) and pill-shaped floating action buttons anchored at the bottom-right, decoupling meta-utilities (Clear, Share, PNG, SVG download) from the content layer.
4. **Segmented Pills & Swatches**: Controls use modern rounded pill chips (`rounded-full`) and compact color pickers without intrusive input frames.
5. **Universal Footer**: Shared 3-column MANPUC footer with vertical brand logo, navigation links, and theme/language selector.

## Colors

Strictly monochromatic in idle states. Color is preserved for:
- The user's QR code itself.
- Semantic contrast status badges (Green: Safe, Amber: Warning, Red: Danger).

## Components

- **Pill Buttons (`.pill-btn`)**: 48px height, 9999px border-radius, `Space Mono` uppercase typography, snappy 150ms transitions.
- **Seamless Input (`.seamless-hero-input`)**: Borderless, transparent, 1.5rem–1.75rem `Quicksand` font.
- **Segment Chips (`.segment-chip`)**: Rounded capsule buttons for switching dot styles and emoji modes.
