## Sharp Edges

### Portfolio more complex than your actual work

Severity: MEDIUM

Situation: Spent 6 months on portfolio, have 2 projects to show

Symptoms:
- Been "working on portfolio" for months
- More excited about portfolio than projects
- Portfolio tech more impressive than work
- Afraid to launch

Why this breaks:
Procrastination disguised as work.
Portfolio IS a project, but not THE project.
Diminishing returns on polish.
Ship it and iterate.

Recommended fix:

## Right-Sizing Your Portfolio

### The MVP Portfolio
| Element | MVP Version |
|---------|-------------|
| Hero | Name + title + one line |
| Projects | 3-4 best pieces |
| About | 2-3 paragraphs |
| Contact | Email + LinkedIn |

### Time Budget
```
Week 1: Design and structure
Week 2: Build core pages
Week 3: Add 3-4 projects
Week 4: Polish and launch
```

### The Truth
- Your portfolio is not your best project
- Shipping beats perfecting
- You can always iterate
- Better projects > better portfolio

### When to Stop
- Core pages work on mobile
- 3-4 solid projects showcased
- Contact form works
- Loads in < 3 seconds
- Ship it.

### Portfolio looks great on desktop, broken on mobile

Severity: HIGH

Situation: Recruiters check on phone, everything breaks

Symptoms:
- Looks great in browser DevTools
- Broken on actual phone
- Text too small
- Buttons hard to tap
- Navigation hidden

Why this breaks:
Built desktop-first.
Didn't test on real devices.
Complex interactions don't translate.
Forgot about thumb zones.

Recommended fix:

## Mobile-First Portfolio

### Mobile Reality
- 60%+ traffic is mobile
- Recruiters browse on phones
- First impression = mobile impression

### Mobile Must-Haves
- Readable without zooming
- Tappable links (min 44px)
- Navigation works
- Projects load fast
- Contact easy to find

### Testing Checklist
```
[ ] iPhone Safari
[ ] Android Chrome
[ ] Tablet sizes
[ ] Slow 3G simulation
[ ] Real device (not just DevTools)
```

### Graceful Degradation
```css
/* Complex hover → simple tap */
@media (hover: none) {
  .hover-effect {
    /* Show content directly */
  }
}
```

### Visitors don't know what to do next

Severity: MEDIUM

Situation: Great portfolio, zero contacts

Symptoms:
- Lots of views, no contacts
- People don't know you're available
- Contact page is afterthought
- No clear ask

Why this breaks:
No clear CTA.
Contact buried at bottom.
Multiple competing actions.
Assuming visitors will figure it out.

Recommended fix:

## Portfolio CTAs

### Primary CTAs
| Goal | CTA |
|------|-----|
| Get hired | "Let's work together" |
| Freelance | "Start a project" |
| Network | "Say hello" |
| Specific role | "Hire me for [X]" |

### CTA Placement
```
Hero section: Main CTA
After projects: Secondary CTA
Footer: Final CTA
Floating: Optional persistent CTA
```

### Making Contact Easy
- Email link (mailto:)
- LinkedIn (opens new tab)
- Calendar link (Calendly)
- Simple contact form
- Copy email button

### What to Avoid
- Contact form only (people hate forms)
- Hidden contact info
- Too many options
- Vague CTAs ("Learn more")

### Portfolio shows old or irrelevant work

Severity: MEDIUM

Situation: Best work is 3 years old, newer work not shown

Symptoms:
- jQuery projects in 2024
- I did this in college
- Tech stack doesn't match target jobs
- Haven't touched portfolio in 2+ years

Why this breaks:
Haven't updated in years.
Newer work is "not ready."
Scared to remove old favorites.
Portfolio drift.

Recommended fix:

## Portfolio Freshness

### Update Cadence
| Action | Frequency |
|--------|-----------|
| Add new project | When completed |
| Remove old project | Yearly review |
| Update copy | Every 6 months |
| Tech refresh | Every 1-2 years |

### Project Pruning
Keep if:
- Still proud of it
- Relevant to target jobs
- Shows important skills
- Has good results/story

Remove if:
- Embarrassed by code/design
- Tech is obsolete
- Not relevant to goals
- Better work exists

### Showing Growth
- Latest work first
- Date projects (or don't)
- Show evolution if relevant
- Archive instead of delete
