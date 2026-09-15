---
name: awesome-design-md
description: Curated collection of 74+ production-grade DESIGN.md specifications from iconic products (Linear, Stripe, Apple, Vercel, Supabase, Raycast, Claude, etc.). Use to browse, select, and install instant design systems, color tokens, typography scales, and component styling as the visual ground truth for greenfield projects and redesigns.
license: MIT
metadata:
  version: "1.0.0"
  source: "VoltAgent/awesome-design-md"
---

# Awesome DESIGN.md Library

A curated repository of 74+ analyzed, production-grade `DESIGN.md` specifications extracted from industry-leading digital products and brand design systems.

---

## Purpose & Workflow

Instead of designing a design system from a blank slate or relying on generic AI defaults, use this library to instantly inject a comprehensive, battle-tested visual system into your project.

### 1. Browse & Select a Brand Archetype
Locate the matching brand directory under `design-md/<brand-name>/DESIGN.md`:
- **Developer Tools & Terminal**: `linear.app`, `raycast`, `cursor`, `warp`, `mintlify`, `supabase`, `clickhouse`.
- **Fintech & Precision**: `stripe`, `revolut`, `wise`, `coinbase`, `kraken`, `mastercard`.
- **AI & Frontier Tech**: `claude`, `elevenlabs`, `mistral.ai`, `cohere`, `replicate`, `together.ai`, `x.ai`.
- **Clean SaaS & Modern Consumer**: `apple`, `airbnb`, `notion`, `figma`, `framer`, `resend`, `slack`, `vercel`.
- **High-Contrast & Performance**: `ferrari`, `lamborghini`, `bmw-m`, `spacex`, `tesla`.

### 2. Install as Project Ground Truth
Copy the desired specification directly into the project root:
```bash
cp .agents/skills/awesome-design-md/design-md/<brand>/DESIGN.md ./DESIGN.md
```