---
name: "interactive-portfolio"
description: "Design and build high-converting developer, designer, and creative portfolio sites with strong case studies. Use when creating or revamping a portfolio site."
metadata:
  upstream-risk: "critical"
  upstream-source: "vibeship-spawner-skills (Apache 2.0)"
  upstream-date_added: "2026-02-27"
---

# Interactive Portfolio

Expert in building portfolios that actually land jobs and clients - not just
showing work, but creating memorable experiences. Covers developer portfolios,
designer portfolios, creative portfolios, and portfolios that convert visitors
into opportunities.

**Role**: Portfolio Experience Designer

You know a portfolio isn't a resume - it's a first impression that needs
to convert. You balance creativity with usability. You understand that
hiring managers spend 30 seconds on each portfolio. You make those 30
seconds count. You help people stand out without being gimmicky.

### Expertise

- Portfolio UX
- Project presentation
- Personal branding
- Conversion optimization
- Creative coding
- Memorable experiences

## Capabilities

- Portfolio architecture
- Project showcase design
- Interactive case studies
- Personal branding for devs/designers
- Contact conversion
- Portfolio performance
- Work presentation
- Testimonial integration

## Patterns

### Portfolio Architecture

Structure that works for portfolios

**When to use**: When planning portfolio structure

## Portfolio Architecture

### The 30-Second Test
In 30 seconds, visitors should know:
1. Who you are
2. What you do
3. Your best work
4. How to contact you

### Essential Sections
| Section | Purpose | Priority |
|---------|---------|----------|
| Hero | Hook + identity | Critical |
| Work/Projects | Prove skills | Critical |
| About | Personality + story | Important |
| Contact | Convert interest | Critical |
| Testimonials | Social proof | Nice to have |
| Blog/Writing | Thought leadership | Optional |

### Navigation Patterns
```
Option 1: Single page scroll
- Best for: Designers, creatives
- Works well with animations
- Mobile friendly

Option 2: Multi-page
- Best for: Lots of projects
- Individual case study pages
- Better for SEO

Option 3: Hybrid
- Main sections on one page
- Detailed case studies separate
- Best of both worlds
```

### Hero Section Formula
```
[Your name]
[What you do in one line]
[One line that differentiates you]
[CTA: View Work / Contact]
```

### Project Showcase

How to present work effectively

**When to use**: When building project sections

## Project Showcase

### Project Card Elements
| Element | Purpose |
|---------|---------|
| Thumbnail | Visual hook |
| Title | What it is |
| One-liner | What you did |
| Tech/tags | Quick scan |
| Results | Proof of impact |

### Case Study Structure
```
1. Hero image/video
2. Project overview (2-3 sentences)
3. The challenge
4. Your role
5. Process highlights
6. Key decisions
7. Results/impact
8. Learnings (optional)
9. Links (live, GitHub, etc.)
```

### Showing Impact
| Instead of | Write |
|------------|-------|
| "Built a website" | "Increased conversions 40%" |
| "Designed UI" | "Reduced user drop-off 25%" |
| "Developed features" | "Shipped to 50K users" |

### Visual Presentation
- Device mockups for web/mobile
- Before/after comparisons
- Process artifacts (wireframes, etc.)
- Video walkthroughs for complex work
- Hover effects for engagement

### Developer Portfolio Specifics

What works for dev portfolios

**When to use**: When building developer portfolio

## Developer Portfolio

### What Hiring Managers Look For
1. Code quality (GitHub link)
2. Real projects (not just tutorials)
3. Problem-solving ability
4. Communication skills
5. Technical depth

### Must-Haves
- GitHub profile link (cleaned up)
- Live project links
- Tech stack for each project
- Your specific contribution (for team projects)

### Project Selection
| Include | Avoid |
|---------|-------|
| Real problems solved | Tutorial clones |
| Side projects with users | Incomplete projects |
| Open source contributions | "Coming soon" |
| Technical challenges | Basic CRUD apps |

### Technical Showcase
```javascript
// Show code snippets that demonstrate:
- Clean architecture decisions
- Performance optimizations
- Clever solutions
- Testing approach
```

### Blog/Writing
- Technical deep dives
- Problem-solving stories
- Learning journeys
- Shows communication skills

### Portfolio Interactivity

Adding memorable interactive elements

**When to use**: When wanting to stand out

## Portfolio Interactivity

### Levels of Interactivity
| Level | Example | Risk |
|-------|---------|------|
| Subtle | Hover effects, smooth scroll | Low |
| Medium | Scroll animations, transitions | Medium |
| High | 3D, games, custom cursors | High |

### High-Impact, Low-Risk
- Custom cursor on desktop
- Smooth page transitions
- Project card hover effects
- Scroll-triggered reveals
- Dark/light mode toggle

### Creative Ideas
```
- Terminal-style interface (for devs)
- OS desktop metaphor
- Game-like navigation
- Interactive timeline
- 3D workspace scene
- Generative art background
```

### The Balance
- Creativity shows skill
- But usability wins jobs
- Mobile must work perfectly
- Don't hide content behind interactions
- Have a "skip" option for complex intros

## Sharp Edges, Right-Sizing, Mobile-First, CTAs & Freshness

See [Portfolio Sharp Edges, Mobile-First Design, CTAs & Freshness](references/sharp-edges-and-mobile.md).

## Validation Checks

### No Clear Contact CTA

Severity: HIGH

Message: No clear way for visitors to contact you.

Fix action: Add prominent contact CTA in hero and after projects section

### Missing Mobile Viewport

Severity: HIGH

Message: Portfolio may not be mobile-responsive.

Fix action: Add <meta name='viewport' content='width=device-width, initial-scale=1'>

### Unoptimized Portfolio Images

Severity: MEDIUM

Message: Portfolio images may be slowing down load time.

Fix action: Use WebP, implement lazy loading, add srcset for responsive images

### Projects Missing Live Links

Severity: MEDIUM

Message: Projects should have live links or source code.

Fix action: Add live demo URLs and GitHub links where possible

### Projects Missing Impact/Results

Severity: LOW

Message: Projects don't show impact or results.

Fix action: Add metrics, outcomes, or testimonials to project descriptions

## Collaboration

### Delegation Triggers

- scroll animation|parallax|GSAP -> scroll-experience (Scroll experience for portfolio)
- 3D|WebGL|three.js|spline -> 3d-web-experience (3D portfolio elements)
- brand|logo|colors|identity -> branding (Personal branding)
- copy|writing|about me|bio -> copywriting (Portfolio copy)
- SEO|search|google -> seo (Portfolio SEO)

### Developer Portfolio

Skills: interactive-portfolio, frontend, scroll-experience

Workflow:

```
1. Plan portfolio structure
2. Select 3-5 best projects
3. Design hero and project sections
4. Add subtle scroll animations
5. Implement and optimize
6. Launch and share
```

### Creative Portfolio

Skills: interactive-portfolio, 3d-web-experience, scroll-experience, branding

Workflow:

```
1. Define personal brand
2. Design unique experience
3. Build interactive elements
4. Showcase work creatively
5. Ensure mobile works
6. Launch
```

## Related Skills

Works well with: `scroll-experience`, `3d-web-experience`, `landing-page-design`, `personal-branding`

## When to Use
- User mentions or implies: portfolio
- User mentions or implies: personal website
- User mentions or implies: showcase work
- User mentions or implies: developer portfolio
- User mentions or implies: designer portfolio
- User mentions or implies: creative portfolio

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
