## House rules

These hold on every build, whatever the direction. `inspect.mjs` measures them.

| Rule | Instead |
| --- | --- |
| **Headlines: two lines or fewer, at every width.** Every `h1`–`h6`, and the main line of the first screen whatever its tag. | Cut words. Then widen the measure. Size last. |
| **A clear title on the first screen**, in the page's one `h1`, and a heading on every section. | Say what this is: the name with what it does, the product with what it is for, the event with its date and place. |
| **Equal outer margins; no section huddled on one side** with the other half of the screen empty. | Close every void with something on its far side: the section's picture, a second column, a list, a figure. |
| **No blank stretches** taller than about half a screen. | The normal section gap. A deliberate rest is a placed picture or a field of colour, once per page. |
| **Statements are paragraphs.** An intro sentence or a quotation set large is marked up as `<p>` or `<blockquote>`, stays at statement size (36px or less on desktop, 24px on a phone) and runs to about 25 words, three lines. | Larger than that it is a headline and the two-line rule applies. In blind tests jurors read a 42px sentence over four lines as a four-line headline. |
| **No eyebrows.** No small label above a heading, no pill badge above the headline, no "New ·" chip. | Put the information in the heading or the first sentence, or drop it. |
| **No monospace** outside real code blocks. | The text face. Tabular figures where numbers align. |
| **No index numbering.** No 01 / 02 / 03, no (001), no "Step 2". | Order shown by position, size, or the words. A real `<ol>` if order matters. |
| **No thin rules.** No hairline dividers, no 1px outlined boxes, no grid lines, crosshairs or crop marks. | Space. A step in background tone. A change of scale. A filled shape. |
| **No gradients.** Not as backgrounds, not on buttons, not in text. | Flat colour, or a real photograph. A neutral scrim under text on a photo is the one exception. |
| **No shadows on things at rest.** No glows. | A tone step between surfaces. Shadows only on what truly floats: a menu, a dialog. |
| **No assistant palette.** No yellow-cream ground with terracotta or rust; no violet or indigo. | The dealt palette. |
| **No tiny uppercase letter-spaced labels.** | Sentence case at a readable size. |
| **No icon-topped feature cards, no rows of identical cards.** | The dealt section blueprint. |
| **No glass.** No backdrop blur panels, no floating pill navigation. | A plain bar: wordmark, a few links, one action. |
| **No emoji, no gradient blobs, no decorative shapes, no fake dashboards of grey bars.** | A real picture, a real interface fragment, or nothing. |
| **No styled accent word** in a headline (italic, serif, coloured, underlined). | One face, one colour. The words carry the emphasis. |
| **Two typefaces at most,** usually one. | The dealt type system. |

Three places keep their own conventions and are left alone by the inspector: real code in
`<pre>`/`<code>` (monospace is correct there), real tables and form fields (they may have lines), and
a real interface fragment whose root carries the attribute `data-ui` (the product's own borders and
menus; see `references/imagery.md` §7).

Why these, honestly. Some are what the study measured: among the 247 sites, those the panel scored
7.5 or higher used icon feature cards 1% of the time against 28% for sites under 6.5, pill badges 14%
against 34%, gradients 22% against 52%, shadows 24% against 48%, tiny tracked caps 16% against 57%.
Others are the owner's taste and go against current gallery fashion: monospace labels, index numbers
and hairline grids are actually *more* common on award sites than on weak ones, which is exactly why
generators imitate them and why they now read as costume. They are banned here without exception.
`references/tells.md` keeps the dated registry.

Removing ornament leaves space. Never fill it with another ornament. Fill it with scale (make the main
thing larger), with the full content, with a picture made for this subject, or with a field of flat
colour. Leave it empty on purpose once per page at most.

## Laws of the craft

Short form. Numbers are from the study unless marked as house style.

**Type**
- Two or three sizes do the visible work: one very large, one small, nothing in between. Median
  headline-to-body ratio on the studied sites is 4.3; the best go far beyond (largest type: median
  8.4vw on the top sites against 5.0vw on the weak ones).
- Display type: tracking -0.02 to -0.05em, leading 0.85–1.05. Text: 16–20px, leading 1.45–1.6,
  45–75 characters per line.
- Five sizes on a page is the ceiling. One family is normal (a third of the studied sites); two is the
  limit.
- Left-aligned by default. Centre at most one moment.

**Space**
- One grid, one pair of tight margins (16–32px), used everywhere; large things run to the edges. Text
  blocks share two or three left edges on the whole page.
- Asymmetry inside the grid, never in the frame: the two outer margins are equal, and an off-centre
  heading is answered by something at the far side of the grid.
- The gap between sections is clearly larger than any gap inside one: 120–240px on desktop (the study's median is about 240).
- Each section has a different composition from its neighbours; none is a card grid.

**Colour**
- One ground, one ink, one accent. The accent appears on the action and perhaps one other thing.
- Running text in the full ink. A page set in soft grey reads unfinished.
- Surfaces are separated by a small step in tone, never by a line or a shadow.
- A section may change the whole field colour. Nothing fades into anything.

**Imagery**
- One dominant image beats six small ones. On the top-scored sites the hero media covers at least half
  the first screen 68% of the time.
- Same crop ratios, same treatment, square corners unless the direction says otherwise (73% of the
  studied sites leave media square).
- No image is better than a placeholder, an icon, or an abstract shape. A picture drawn for this
  subject, in its colours and with care, is better than either. A real picture of its world, found
  and credited, is better still.
- Every found picture is downloaded into the project, credited on the page and listed in the report.
  None is presented as the client's own.
- Nothing ever lies on top of a headline or a statement (the inspector fails it).

**Components**
- Buttons: flat, one fill colour, either square-cornered or fully round, decided once (top sites: 52%
  square, 23% pill; the 9–16px "soft" radius is the weak-site default). Most strong heroes have no
  button at all, or one.
- Navigation: wordmark, three to five plain links, one action. No bar chrome.
- A control explains how to use it by its form, its label and its place. When it seems to need a
  sentence on how to operate it, redesign the control instead of adding the sentence. What a field
  accepts is different. First remove the limit where you can: a date picker, or a parser that takes
  any common format. A limit that remains, such as password rules or file type and size, stays visible
  beside the field and is tied to it with `aria-describedby`.
- The footer is a designed close, not a sitemap: on most strong sites the name returns at full width.

## Special cases

**An existing brand or design system.** Pass `--keep palette,type`, map the brand's colours and faces
onto the roles, and take only composition from the draw. The house rules still apply; if the brand
itself requires a banned device (its logo sits in a gradient, its accent is violet), keep the brand
asset, say so in the report, and pass `--allow <rule>` to the inspector for that rule only.

**Redesign, restyle or review of an existing page or app screen.**

1. **Record the before.** Run the project as it is and inspect it into its own folder
   (`inspect.mjs <url> --out .taste-skill/before`, with `--app` for an app screen) and lint its
   source. Read the code: the framework, the styling method (Tailwind v3 or v4, CSS modules,
   styled-components, plain CSS), the components, and what must survive: routes, forms, data,
   behaviour, the brand's own assets.
2. **A review stops here.** Critique the before screenshots with `references/critique.md`, list the
   findings with the inspector's measurements, and name the three changes that would move the page
   most.
3. **Keep the stack, the content and what works.** No framework or styling-library migration; check the
   dependency file before adding anything. A restyle keeps the layout and takes type, colour and
   components from a dealt direction (`--keep` whatever the brand fixes); a redesign deals a full
   direction and rebuilds the sections from its blueprints inside the existing components. Either way
   proceed from step 2 of the run with the page's real content.
4. **Order of work, biggest effect for least risk:** type (faces and scale), colour (one ground, one
   ink, one accent), the frame (margins, section rhythm, a title on the first screen and a heading on
   every section), states (hover, focus, loading, empty, error), then the stock components (icon
   cards, pill badges, gradient blobs, card grids) replaced by the dealt blueprints.
5. **Prove it.** Inspect again into `.taste-skill/after`, compare before and after at every width,
   click through every link, form and menu that worked before, and report the before and after
   measurements side by side.

**A component or a single section, not a page.** Skip the draw unless there is no direction to follow.
Match the surrounding design, apply the house rules and the laws, and still inspect the result.

**No checkout, no form backend.** The primary button goes to the real destination when the brief names
one. Otherwise it opens an email with a written subject and body (`mailto:` with the visitor's choices
filled in), or, for a shop, it points at `#checkout` and the report says it must be wired before
launch. Never fake a payment form.

**No Chrome or Node 22.** Run `lint.mjs` (Node 18+), take screenshots with whatever browser tool you
have, and critique those. Say in the report that the inspector could not run.

**No network.** If `assets.mjs` reaches no source, draw the pictures and say in the report that the
open collections could not be searched.
