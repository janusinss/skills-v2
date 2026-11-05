## 4. GENERATE ENOUGH SCREENS RULE

Generate enough screens to make the flow feel real.

Do not be lazy with screen count.

If the user asks for:
- 1 screen → generate 1 screen image
- 2 screens → generate 2 screen images
- 3 screens → generate 3 screen images
- 5 screens → generate 5 screen images
- 7 screens → generate 7 screen images
- onboarding flow → generate multiple onboarding screens, not one
- auth flow → generate separate sign in / sign up / recovery states when useful
- app concept → generate a meaningful set, not one isolated hero mockup

It is better to generate:
- multiple clean readable screens
than:
- one compressed board with tiny unreadable text

If a detail is unclear:
- generate an extra detail image
- or regenerate that screen cleanly

Never reduce screen count just for convenience if it weakens the app concept.

---

## 5. DO NOT CROP OLD IMAGES RULE

When a screen or detail needs a dedicated view, do not just crop or zoom into a previously generated larger image.

Do not:
- crop a settings view out of a larger board
- crop tiny onboarding copy out of a multi-screen collage
- crop a small card from a broader screen to inspect it
- rely on cutouts if they distort spacing, proportions, or typography

Instead:
- generate a fresh standalone screen image
- generate a fresh detail render
- keep the same design language, colors, type mood, and component family
- make the new image specifically optimized for readability

Fresh screen-specific generation is strongly preferred over cropping.

---

## 6. APP DESIGN BIBLE RULE

When generating multiple images for the same app, lock an internal design bible before continuing.

This design bible should remain consistent across the whole set:
- platform mode
- device frame style
- device scale
- palette logic
- typography mood
- type scale rhythm
- spacing system
- corner radius logic
- icon style
- illustration / imagery treatment
- texture intensity
- decorative asset language
- navigation model
- card and list behavior
- button styling
- shadow language

Do not let screen 3, 4, or 5 drift into a different app.

Every new screen should feel like it belongs to the same product world.

---

## 7. MULTI-SCREEN CONSISTENCY RULE

If multiple screens are requested, consistency is mandatory.

Keep consistent:
- overall brand mood
- type hierarchy
- palette
- safe-area handling
- navigation behavior
- component family
- surface treatment
- card treatment
- background logic
- image framing
- decorative accents
- device frame presentation

Variation is allowed in:
- composition
- feature emphasis
- image placement
- screen purpose
- visual tempo

But not in:
- product identity
- design system
- mockup quality
- core spacing logic

The flow should feel varied but unified.

---

## 8. LOGICAL FLOW RULE

When multiple images are generated, they must form a believable app flow.

Do not generate random unrelated screens.

The screen order should make sense.

Examples:
- onboarding → auth → home
- home → browse → detail
- profile → settings → edit profile
- cart → checkout → confirmation
- dashboard → activity → detail
- welcome → permissions → personalized home

Ask internally:
- why does screen 2 come after screen 1?
- what action or navigation leads to the next screen?
- is this a believable user journey?
- does the UI state carry forward logically?

A good screen set should feel like a real product walkthrough, not a loose visual collection.

---

## 9. DEFAULT MOCKUP PRESENCE RULE

By default, present the mobile UI inside a clean phone mockup with a visible device border/frame.

This should usually be:
- a clean iPhone-style mockup for iOS or neutral premium concepts
- a clean Android-style mockup for Android-native concepts
- a subtle premium generic phone mockup for cross-platform concepts

Do not omit the device frame by default.

Only remove the visible device frame if:
- the user explicitly asks for raw screen-only output
- the concept clearly benefits from borderless presentation
- the user asks for UI sheets or assets instead of full phone compositions

Default rule:
phone mockup present  
content still primary

---

## 10. DEVICE MOCKUP FRAME RULE

When using an iPhone, Android, or generic phone mockup, the mockup must look clean and premium.

Rules:
- use one coherent device style across the full set unless the user explicitly wants mixed devices
- keep device scale consistent across all screens in the same series
- keep the mockup centered or aligned with clear discipline
- keep outer spacing around the device clean and balanced
- keep top, bottom, left, and right canvas margins visually even
- do not let the phone touch the canvas edges
- do not use awkwardly cropped device frames
- do not use inconsistent bezels or random frame sizes across screens
- keep shadows soft and controlled
- keep the mockup presentation calm and premium
- the phone border/frame should be visible and clean
- the mockup should support the screen, not overpower it
- keep visual emphasis on the UI content inside the phone

If multiple device mockups appear in one composition:
- keep the same scale
- keep equal gutter spacing between devices
- align them cleanly
- avoid random overlap unless explicitly art-directed

If the concept works better without a visible device frame:
- only then present the screen cleanly with equal outer margins and controlled padding

The presentation should feel:
- neat
- balanced
- premium
- intentional
- content-first

---

## 11. ONBOARDING FLOW RULE

Onboarding should not feel like repeated template slides.

If the user asks for onboarding:
- generate multiple distinct onboarding screens
- vary composition across screens
- vary the balance of image, text, and CTA
- keep the flow coherent
- keep copy short
- keep the first screen especially clean

Good onboarding should feel:
- clear
- fast
- helpful
- visually memorable
- not overexplained

Avoid:
- 3 identical screens with only icon and headline changes
- too much copy
- giant abstract blobs with no product meaning
- fake motivational filler language
- early rating/review prompts
- cluttered first-run screens

---

## 12. FIRST SCREEN CLEANLINESS RULE

The first visible screen matters most.

Whether it is:
- onboarding
- home
- auth
- intro
- welcome
- dashboard

it must feel:
- calm
- premium
- immediately readable
- visually focused

Rules:
- use one primary focal point
- keep the top screen area controlled
- keep the headline short
- do not overload the first viewport
- do not fill it with extra stats, chips, tags, or pills
- do not bury the main CTA
- make the first screen work on a normal phone size without feeling cramped
- if imagery is used behind text, preserve clear readability with fades, masks, or soft scrims

Strong preference:
- 1 to 3 short lines for the main statement
- concise supporting text
- one clear next action

Avoid:
- giant wall of text
- too many micro-labels
- too many overlapping cards
- fake enterprise complexity
- "website hero inside a phone frame"

---

