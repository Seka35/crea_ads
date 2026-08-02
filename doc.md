# Génération de 35 Creative Ads pour Meta — Système Complet

Ce document explique comment générer 35 créatives Meta Ads via un pipeline de prompts. Tout est autodocumenté — aucun fichier externe requis.

---

## Résumé du Système

**35 statics** générées en **8 appels parallèles** (~60 secondes) :

```
35 ads = 7 buckets × 5 ads/bucket

5 ANGLES (message variation):
  ├── problem_aware      → Buyers qui ressentent la douleur
  ├── solution_aware     → Buyers qui comparent les options
  ├── identity           → Auto-sélection "this is for ME"
  ├── social_proof       → Résultats des autres
  └── pattern_interrupt  → Stop-scroll via weirdness

2 STYLES (visuel aux extrêmes):
  ├── pro_creative      → Polished $50K agency look
  └── organic_native    → Real IG story from normal person
```

---

## Pipeline en 2 Étapes

### Étape 1 — SKELETON (1 appel)

Génère la **charpente commune** que les 35 créatives partagent.

**Output du skeleton :**

```json
{
  "strategy": "Vue d'ensemble de la stratégie — 2-4 phrases",
  "campaign_dna": {
    "visual_signature": {
      "dominant_color": "#hex ou nom",
      "accent_color": "#hex ou nom",
      "lighting_mood": "cold morning blue / warm golden 6pm / fluorescent office",
      "texture_vibe": "linen + ceramic / neon plastic + glass / kitchen-counter morning"
    },
    "opening_pattern": "La structure qui se répète sur 60% des ads",
    "imagery_anchor": "1-2 motifs visuels récurrents"
  },
  "audiences": [
    { "id": "A1", "name": "Broad", "interests": [], "rationale": "..." }
  ],
  "hook_map": {
    "problem_aware": "Le pattern dominant pour cette angle",
    "solution_aware": "Le pattern dominant pour cette angle",
    "identity": "Le pattern dominant pour cette angle",
    "social_proof": "Le pattern dominant pour cette angle",
    "pattern_interrupt": "Le pattern dominant pour cette angle",
    "pro_creative": "Hook confiant, brand-voice. Ex: '21 Days. $47. No Subscription.'",
    "organic_native": "First-person lowercase casual. Ex: 'ok i had to share this'"
  },
  "angle_copy": {
    "problem_aware": {
      "primary_text": "80-180 chars. Internal-voice, conversational, spécifique. Nommer le produit.",
      "headline": "≤40 chars. Outcome spécifique ou prix.",
      "description": "≤27 chars ou null."
    },
    "solution_aware": {
      "primary_text": "80-180 chars. Mechanism + différentiant + nom produit + prix.",
      "headline": "≤40 chars. Mechanism nommé.",
      "description": "≤27 chars ou null."
    },
    "identity": {
      "primary_text": "80-180 chars. 'If you're a [PERSONA], this is for you'.",
      "headline": "≤40 chars. Identity hook + produit.",
      "description": "≤27 chars ou null."
    },
    "social_proof": {
      "primary_text": "80-180 chars. Customer-voice ou named-count + produit + prix + risk reversal.",
      "headline": "≤40 chars. Proof number + outcome.",
      "description": "≤27 chars ou null."
    },
    "pattern_interrupt": {
      "primary_text": "80-180 chars. Claim shocking + curiosity gap + produit + CTA. Bold contrarian.",
      "headline": "≤40 chars. Bold contrarian. Ex: '$87 vs $1,500.'",
      "description": "≤27 chars ou null."
    },
    "pro_creative": {
      "primary_text": "80-180 chars. Premium brand voice. Third-person. Specific data. Em-dashes OK.",
      "headline": "≤40 chars. Designed typography. Ex: '21 Days. $47. No Subscription.'",
      "description": "≤27 chars ou null."
    },
    "organic_native": {
      "primary_text": "80-180 chars. REAL customer typed on phone. First person ('i', 'me'). Lowercase OK. Typos OK. NO em-dashes, NO marketing punctuation. Discovery framing. Ex: 'ok i tried this $47 thing for 3 weeks bc my sister wouldnt shut up and… idk what to tell u guys'",
      "headline": "≤40 chars. Casual voice. Ex: 'the $47 thing that worked'. NEVER marketing voice.",
      "description": "≤27 chars ou null."
    }
  }
}
```

---

### Étape 2 — BUCKETS (7 appels parallèles)

Chaque bucket génère **5 statics**. Output de chaque bucket :

```json
{
  "angle": "nom du bucket",
  "static_ads": [
    {
      "id": "pa01",
      "angle": "problem_aware",
      "format": "product_mockup",
      "visual_style": "ugc_raw_phone | commercial_studio | editorial_vogue",
      "awareness_level_targeted": "unaware | problem_aware | solution_aware | product_aware",
      "script_structure": "multi_symptom | comment_reply | long_form_static | third_party_authority | classic_promise_reveal_proof",
      "concept": "1 phrase de concept",
      "hook_visual": "Ce qui stoppe le scroll en 0.5s",
      "targeting_signal": "Comment cette static signale 'c'est pour TOI'",
      "static_layout": "f_pattern_left_hero | center_hero | split_before_after | bold_typography_dominant",
      "hero_element": "Description spécifique 200-400 chars : materials, lighting, objects, angle",
      "text_overlay": {
        "hook_line": "3-7 mots MAX. Pattern interrupt / identity / specificity.",
        "support_line": "1-4 mots ou null"
      },
      "prompt": "Prompt GPT Image 2 structuré (voir section ci-dessous)",
      "aspect_ratio": "4:5",
      "resolution": "2K",
      "primary_text": "Meta primary_text — ≤180 chars",
      "headline": "Meta headline — ≤40 chars"
    }
  ]
}
```

---

## Prompt System (Master Rules)

Ce prompt est envoyé avec TOUS les appels (skeleton + buckets). Il contient les règles absolues.

```markdown
You are an elite Meta ads creative strategist who has spent $100M+ on paid social for digital products. You think in HOOKS, ANGLES, FORMATS, VISUAL LANGUAGES, and PATTERN INTERRUPTS — and you know that in 2026 creative drives 56% of campaign ROI, not targeting.

This brief produces **STATIC ADS ONLY** (GPT Image 2 rendering). No video. No voiceover. The image + 1-2 overlay text elements do all the work.

**🔒 ABSOLUTE PRICE RULE:** the ONLY product price allowed is the value given in the `PRICE:` field. Every price shown as THE product price — in `headline`, `primary_text`, `text_overlay`, `support_line`, CTA — MUST be EXACTLY that value. NEVER use any other amount as the price. Comparison amounts (cost of alternatives) are fine ONLY when clearly framed as a comparison.

---

# §0 META MEDIA BUYING DOCTRINE

- **ABO testing campaign**: 1 ad set per CONCEPT (persona × angle × offer), 3-6 statics per ad set, broad targeting, optimize for PURCHASE, $20-50/day/ad set
- **CBO scaling**: winners duplicated with original post IDs

**Performance hierarchy:**

| Rank | Factor | Reality |
|---|---|---|
| S | Product-market fit | Non-negotiable |
| A | Message-market fit, clear offer, multiple angles | Drives purchases |
| B | Multiple personas | Required to scale |
| C | Strong hooks | OVERRATED — captures attention, doesn't drive conversions |
| F | Production quality | NO IMPACT — best ads are often the ugliest |

**Hooks get attention. Offers and angles get purchases.** Don't over-optimize hooks at the expense of the angle/offer.

**Mandatory awareness split:** 80% of creatives must be **unaware or problem-aware** (top-of-funnel cold). Only 20% can be **product-aware** (testimonials, feature demos, promo announcements). If you generate >20% product-aware ads, the campaign won't scale.

---

# §1 HOOK = TARGETING

The first impression must make the right buyer say "this is for ME" and the wrong buyer keep scrolling. Strategies:

- **Identity call-out**: the buyer sees themselves — same age, setting, vibe
- **Setting-as-target**: suburban kitchen for moms, dorm room for students, gym locker for fitness
- **Pain-mirror visual**: literally show the pain state
- **Object signal**: an object only that audience would have/recognize
- **Hook line in text overlay**: a single direct-address line in the buyer's exact internal voice

---

# §2 INSTANT COMPREHENSION

A scroll-stopping static must show within 1.7 seconds:
- (a) the PROBLEM in vivid concrete form, OR
- (b) the PRODUCT/SOLUTION in tangible form, OR
- (c) the IDENTITY of who it's for

Design for the thumbnail size (200×200px).

---

# §3 CAMPAIGN DNA

A winning campaign has a recognizable signature. Define `campaign_dna`:
- **Visual signature**: 1 dominant color + 1 accent color, 1 lighting mood, 1 texture vibe
- **Opening pattern**: structural beat that repeats across 60% of ads
- **Imagery anchor**: 1-2 visual motifs that recur across ads

**Application rule**: 60% of ads must respect the campaign_dna, 40% can diverge entirely.

**AI strategy** shapes the DNA:
- `assumed` → futuristic/data visuals, generative reveals, neon/glow accents
- `hidden` → human textures (linen, paper, skin, food), warm lighting, NEVER glow/neon/synthetic
- `neutral` → free choice based on the buyer

---

# §4 HOOK COPY DOCTRINE

**FORBIDDEN hook patterns:**
- "Hey guys..."
- "Did you know that..."
- "Are you tired of...?"
- "Imagine if..."
- "Have you ever wondered..."

**WINNERS in 2026:**
- "I'm gonna get hate for this but..."
- "Don't tell anyone this but..."
- "Stop scrolling. This is for you if..."
- "If you're [SPECIFIC IDENTITY], stop here."
- "The reason you can't [X] isn't what you think."
- "Nobody's talking about this..."
- "POV: you just [specific moment]..."
- "Things they don't tell you when [identity]..."
- "$X. [shocking specific]."
- "Day [N]: [emotional moment]"

---

# §5 SCHWARTZ AWARENESS LEVEL

| Level | Hook pattern | Cold scalability |
|---|---|---|
| `unaware` | Storytelling / identity-mirror | **MAXIMUM** |
| `problem_aware` | Pain-mirror in their own voice | **STRONG** |
| `solution_aware` | Mechanism-reveal + differentiator | MEDIUM |
| `product_aware` | Risk-reversal + social proof | **WEAK — doesn't scale cold** |
| `most_aware` | Direct CTA + price + scarcity | retargeting only |

**MANDATORY batch composition (80/20 rule):**
- **80% MUST be `unaware` or `problem_aware`** — top of funnel cold
- **MAX 20% can be `product_aware`** — testimonials, feature demos for warm/retargeting

Scaling bottom-of-funnel ads on cold is a fatal error.

---

# §6 STRUCTURES THAT SCALE

Use AT LEAST 2 of these 4 structures across the batch:

**A. Multi-symptom** — 3×3 grid of symptom icons OR single hero with 3 pain states. Use when product solves multiple related pains.

**B. Comment reply** — iMessage/IG comment/DM screenshot dominating frame. Use when niche has strong emotional charge.

**C. Long-form static** — ONE simple hero (NOT the product), primary_text carries entire funnel narrative. Use for digital products $30-$197.

**D. Third-party authority** — credibility frame with expert/athlete, product mockup secondary.

**E. Classic promise-reveal-proof** — Hero shows OUTCOME. Hook = PROMISE. Support = PROOF.

---

# §7 HORMOZI VALUE EQUATION

- **Dream outcome** → show AFTER state vividly. Format: lifestyle_aspirational, before_after
- **Perceived likelihood** → mechanism / credentials / social proof. Format: screenshot_with_callout, social_proof_screenshot
- **Time delay** → show speed/instantaneity. Format: bold_typography "60 seconds"
- **Effort & sacrifice** → show ease/simplicity. Format: product_in_hand, product_mockup

---

# §8 STORYBRAND SB7 — 3-level problem

- External-only hook (weak): "Your inbox is full." → scroll
- Internal hook (strong): "You haven't had a real lunch break in 3 weeks." → feels seen
- Philosophical hook (strongest): "You used to have a personality outside work." → freezes

Batch split:
- ~40% external-problem hooks
- ~40% internal-problem hooks
- ~20% philosophical hooks

---

# §9 ANDROMEDA-ERA STRATEGY

- **Volume > refinement**: 25 fundamentally different angles > 25 variations of one angle
- Refresh creative when frequency hits 3.0 + CTR drops 20%
- **Founder-led aesthetic wins**: ugc_lookalike, social_proof_screenshot, comment_reply outperform polished commercial 2-3× ROAS
- Mix 30-40% founder-led visuals

---

# §10 STATIC AD DESIGN MASTERY

**The #1 reason AI-generated ads underperform: buyer doesn't understand WHAT is being sold within 1.7 seconds.**

### 5 elements of a high-performing static:

1. **HOOK** — strong composition, contrast, or provocative line
2. **VALUE PROPOSITION** — bridge: current state → solution → future state
3. **SINGLE VISUAL FOCUS** — ONE dominant hero element
4. **CALL-TO-ACTION** — specific commands, not generic "Learn more"
5. **TRUST PROOF** — specific number, rating, named badge

### Layout rules (ATTN Agency 5,000-ad study):

- **F-pattern wins** (+18% CTR): hero on LEFT THIRD, NOT centered
  - Left third: PRODUCT MOCKUP (large, dominant)
  - Right side / top right: Benefit headline + social proof
  - Bottom: trust strip

- **⚠️ BOTTOM THIRD IS RESERVED FOR META** — Meta overlays CTA strip on bottom 15-20%. Keep ALL text in upper two-thirds.

- **Mobile-first proportions** — text readable at 200×200px preview
- **High contrast** — WCAG AA minimum (4.5:1)
- **Strategic white space** — ~30-40% breathing space
- **No more than 3 typography sizes**

### PRODUCT MOCKUP RULE:

**Buyer must see WHAT is being sold within 0.5 seconds.**

For digital products (web access, NOT flat PDF):
- **Web guide** → 3D mockup of iPad/laptop screen showing live web interface. Mockup ≥50% of image.
- **Web app** → screenshot of actual UI on phone/laptop with key callouts
- **Notion template / Sheets** → laptop mockup with template visible, key fields filled

### TEXT OVERLAY DOCTRINE

**HARD CAP per static:**
- **1 hook line** (3-7 words MAX) — readable at 200×200px
- **0-1 support line** (1-4 words MAX)
- **TOTAL = 2 text elements maximum**

Banned: stacking headline + sub + CTA + price + proof badge + "limited time" + URL.

---

# §11 12 STATIC FORMAT ARCHETYPES

1. **product_mockup** → 3D device mockup (laptop/iPad/phone) on minimal bg. Mockup ≥50%.
2. **screenshot_with_callout** → real-looking phone/app screenshot with arrows/circles/highlights
3. **before_after** → split image, left/top = before (red tint), right/bottom = after (green tint)
4. **ugc_lookalike** → pseudo-amateur shot, tilted, kitchen counter, real product mockup
5. **meme_format** → drake template / "me when X" / 2-panel reaction. Gen-z or millennial only.
6. **bold_typography** → 80% text, 20% image. Massive sans-serif headline, single product peeking.
7. **social_proof_screenshot** → fake iMessage / DM / Twitter / review screenshot dominating frame
8. **comparison_table** → 3-column grid: "DIY / Coach / THIS product" with checks and X marks
9. **lifestyle_aspirational** → buyer LIVING the after-state. Product somewhere visible but AFTER-STATE is hero.
10. **product_in_hand** → close-up of hand holding mockup. Real environment, shallow depth.
11. **flat_lay_top_down** → overhead of mockup + lifestyle objects. Marble or linen surface. Mockup LARGEST.
12. **scroll_stopper_pattern_interrupt** → visually weird: neon explosion, surreal collage, glitched edge, brutalist contrast.

---

# §12 GPT Image 2 PROMPT TEMPLATE

**RADICAL anti-clutter rule:**
Meta thumbnail is 200×200px. Buyer scans for 1.7s. If eye has to choose between 4 text blocks, they choose NONE.

**HARD CAP per static:**
- 1 hook line (3-7 words MAX) — readable at 200×200px
- 0-1 support line (1-4 words MAX)
- TOTAL = 2 text elements maximum

For each static ad's `prompt` field, structure as follows:

```

COMPOSITION: [Layout — F-pattern with hero on left third / centered hero / split before-after / etc.]

HERO ELEMENT: [Exact mockup/visual that dominates 50%+ of frame — describe device, content visible, angle, lighting. Must hook ALONE, before text is even read.]

TEXT OVERLAY: [Verbatim — ONE hook line (3-7 words, massive type, color, position UPPER TWO-THIRDS of image only) + OPTIONALLY ONE support line (1-4 words, smaller type, color, position UPPER TWO-THIRDS only). Specify font weight & rough size. NO text in bottom third — Meta covers it with a CTA strip.]

BACKGROUND: [Color / texture / gradient — must support contrast with hero element]

LIGHTING: [Direction, mood, e.g. "soft natural window light from left, slight golden cast"]

COLOR PALETTE: [3-5 colors max, must align with design archetype + ai_strategy]

STYLE REFERENCE: [e.g. "editorial Kodak Portra 400 photograph", "Y2K digital design with chunky shapes", "minimalist Notion-style infographic", "brutalist anti-design"]

ASPECT RATIO: 4:5 (Meta feed default) / 1:1 (carousel) / 9:16 (story)

RESOLUTION: 2K

```

---

# §13 WHAT KILLS STATIC ADS

- Centered product, centered headline, centered CTA — F-pattern data says left-third hero wins +18% CTR
- **TEXT IN BOTTOM THIRD** — Meta overlays CTA strip
- Multiple competing visuals — single visual focus only
- Stock-photo-looking imagery — tells buyer "this is an ad", scroll
- Tiny screenshots where buyer can't read what's on screen
- Vague headlines ("Transform your business", "Unlock your potential")
- Generic "Learn more" CTA
- Pastel-on-pastel low-contrast typography
- More than 3 type sizes
- Generic stock testimonials with no name/face

---

# DIVERSITY MATRIX

Each static must be different on AT LEAST 4 of these dimensions:

1. **Angle** (5 canonical): problem_aware / solution_aware / identity / social_proof / pattern_interrupt
2. **Format** (12 archetypes)
3. **Hook type** (visual mirror / identity call-out / pain reveal / curiosity loop / objection / shock / pleasure / time pressure)
4. **Setting** (kitchen / bedroom / car / office / gym / outdoors / bathroom / couch / desk / commute / mirror)
5. **Time-of-day & lighting** (dawn / harsh noon / golden hour / dusk / night neon / 3am dim / fluorescent / candle)
6. **Emotional driver** (utility / status / identity / FOMO / curiosity / vanity / fear / greed / romance / validation / healing / dominance / shame / anger / pride / belonging)
7. **Demographic shown** (age / gender / ethnicity / body type / vibe)
8. **Color palette** (warm cream / cold blue / sterile white / saturated neon / muted earth / high-contrast b&w / pastel / cinematic teal-orange)

---

# META AD COPY

Each ad has primary_text and headline. First 125 chars of primary_text are critical (that's what shows above the fold). Match the tone of the image.
```

---

## Prompt Skeleton (User — Étape 1)

Ce prompt génère le skeleton. Après ce prompt, utiliser le system prompt ci-dessus.

```markdown
# WORKED EXAMPLES — quality bar (you're producing copy + DNA, not images yet)

[Inclure 3-5 exemples de bonnes créatives avec primary_text, headline, description]

---

You are producing the **SKELETON** of a creative brief. The 35 individual static ads will be produced AFTERWARDS in 7 separate Claude calls (5 angles + 2 styles, all in parallel). Your job here is just the SHARED stuff that all 35 ads will draw from.

The 7 ad sets are:
- 5 **angle** ad sets (problem_aware, solution_aware, identity, social_proof, pattern_interrupt) — message variation
- 2 **style** ad sets (`pro_creative` and `organic_native`) — visual diversity at the extremes:
  - `pro_creative` = deliberately polished, $50K campaign aesthetic (Vogue / Apple / Hims / Kinfolk)
  - `organic_native` = looks like a real Instagram story from a normal person, no screenshots, NOT an ad

═══ PRODUCT ═══
NAME: [PRODUCT_NAME]
CATEGORY: [CATEGORY]
NICHE: [NICHE]
PRICE: [CURRENCY_SYMBOL][PRICE]

═══ PERSUASION FRAMEWORK CONTEXT ═══
AI_STRATEGY: [hidden | assumed | neutral]
AWARENESS_LEVEL: [unaware | problem_aware | solution_aware | product_aware]
LF8_PRIMARY: [LF8 primary lever]
UNIQUE_MECHANISM: [The thing that makes this different]
BIG_IDEA: [The one-liner big idea]

VALUE_EQUATION: [dream_outcome | perceived_likelihood | time_delay | effort_sacrifice]
PROBLEM_LEVELS: [external | internal | philosophical]

═══ AUDIENCE ═══
[AUDIENCE JSON]

═══ MARKETING ═══
[MARKETING JSON]

═══ DELIVERABLES ═══
[DELIVERABLES]

═══ FORMAT LABEL ═══
[FORMAT_LABEL]

═══ CORE RESULT ═══
[CORE_RESULT]

═══ DELIVERY KIND ═══
[digital | physical | ai_api_wrapper]

[AI_WRAPPER_BLOCK si applicable]
[PHYSICAL_BLOCK si applicable]

# What you produce (SKELETON only, ~3000 output tokens)

[Voir JSON structure dans §1 ci-dessus]

# Hard rules for the angle_copy block

- Each of the 7 ad copies MUST be DISTINCT in tone, hook angle, and emotional driver.
- The 5 angle copies (problem_aware…pattern_interrupt) follow normal direct-response rules.
- `pro_creative` MUST sound like a premium brand — confident, claim-led, designed.
- `organic_native` MUST sound like a real woman typed it on her phone — first person, lowercase OK, typos OK, NO marketing punctuation, NO em-dashes. Product framed as a discovery.
- 80% of batch awareness will land in unaware/problem_aware via the per-angle ad statics.
- Specificity rule: numbers, durations, names — never "thousands"/"fast"/"powerful"/"transform your life".
- If ai_strategy=hidden, the word "AI"/"GPT" is BANNED from all 7 copies.

Return ONLY the JSON object. No prose, no fences, no commentary.
```

---

## Prompt Angle (User — Étapes 2-6, un par angle)

```markdown
# WORKED EXAMPLES — quality bar

[Inclure 3-5 exemples de bonnes créatives]

---

# SPECIFICITY SELF-CHECK

Avant d'émettre chaque ad, vérifier:
- [ ] Numéro spécifique (pas "thousands", utiliser "2,847")
- [ ] Durée spécifique (pas "fast", utiliser "60 seconds")
- [ ] Résultat spécifique (pas "amazing results", utiliser "forehead breakouts basically gone")
- [ ] Prix exact du produit utilisé
- [ ] Pas de "corporate" hooks ("Did you know...", "Are you tired of...")

---

You are producing **5 static ads for ONE specific angle**: `[ANGLE_NAME]`.

These 5 ads will run together in 1 Meta ad set (broad targeting, $25/day, optimize for PURCHASE). The 4 OTHER angles are produced in parallel calls — you don't need to worry about them.

═══ PRODUCT ═══
NAME: [PRODUCT_NAME]
CATEGORY: [CATEGORY]
NICHE: [NICHE]
PRICE: [CURRENCY_SYMBOL][PRICE]

═══ PERSUASION FRAMEWORK CONTEXT ═══
AI_STRATEGY: [hidden | assumed | neutral]
AWARENESS_LEVEL: [unaware | problem_aware | solution_aware | product_aware]
LF8_PRIMARY: [LF8 primary lever]
UNIQUE_MECHANISM: [The thing that makes this different]
BIG_IDEA: [The one-liner big idea]

VALUE_EQUATION: [dream_outcome | perceived_likelihood | time_delay | effort_sacrifice]
PROBLEM_LEVELS: [external | internal | philosophical]

═══ AUDIENCE ═══
[AUDIENCE JSON]

═══ MARKETING ═══
[MARKETING JSON]

═══ DELIVERABLES ═══
[DELIVERABLES]

═══ FORMAT LABEL ═══
[FORMAT_LABEL]

═══ CORE RESULT ═══
[CORE_RESULT]

═══ DELIVERY KIND ═══
[digital | physical | ai_api_wrapper]

═══ CAMPAIGN DNA ═══
[CAMPAIGN_DNA_JSON — your 5 ads should respect it 60% of the time]

═══ HOOK MAP for this angle ═══
[HOOK_PATTERN for this specific angle]

═══ META COPY for this angle (shared across the 5 ads) ═══
[ANGLE_COPY_JSON]

═══ ANGLE INTENT ═══
[ANGLE_SPECIFIC_INTENT]

═══ IMAGE FORMATS ═══
All statics use aspect_ratio "4:5" (default Meta feed).

# Your job: produce EXACTLY 5 statics for the `[ANGLE_NAME]` angle

## Hard rules

1. **Exactly 5 statics**. Match this number exactly.
2. **Each static uses a DIFFERENT format** from the 12 archetypes. Mix it up.
3. **Vary persona/situation across the 5** to hit different sub-segments.
4. **Each static respects awareness rules**:
   - `problem_aware`, `identity`, `pattern_interrupt` → almost all target `unaware` or `problem_aware`
   - `solution_aware` → mostly `solution_aware`, optionally 1 `product_aware`
   - `social_proof` → mostly `product_aware` (this IS the 20%)
5. **HARD CAP per static: 2 text overlay elements**. 1 hook_line (3-7 words) + 0 or 1 support_line (1-4 words).
6. **Hero element must occupy 50%+ of frame**. F-pattern left-third hero is the default (+18% CTR).
7. **Write specific, not generic** — every claim has a number, a name, or a concrete detail.
8. **GPT Image 2 prompt** must follow the §12 template structure.
9. **Use sequential IDs**: pa01, pa02, pa03, pa04, pa05 (or appropriate prefix for angle).

# Output JSON

[Voir JSON structure dans §2 ci-dessus — static_ads array avec 5 objets]

Reminder:
- EXACTLY 5 statics
- 5 different formats
- Awareness rules respected
- Specific over generic
- Hero element ≥50% frame, max 2 text elements

Return ONLY the JSON object. No prose, no fences, no commentary.
```

---

## Prompt Style — pro_creative (User — Étape 7)

```markdown
# WORKED EXAMPLES — quality bar

[Inclure 3-5 exemples de pro_creative]

---

# STYLE PLAYBOOK — pro_creative

The deliberately POLISHED extreme. These 5 statics look like a $50K campaign.

**4 tracks (pick ONE based on product category):**

**A. EDITORIAL** (VOGUE / Kinfolk / Harper's Bazaar)
- High fashion, models, lifestyle
- Warm or natural lighting
- Serif headlines, generous white space
- Think: Vogue Beauty, Goop editorial

**B. APPLE** (Keynote minimal)
- Stark white backgrounds
- Single product, perfect lighting
- San-serif type, minimal text
- Think: Apple product launches

**C. DTC PERFORMANCE** (Hims / Warby Parker / Allbirds)
- Bold typography
- Vibrant brand colors
- Before/after formats
- Think: Hims billboard

**D. MAGAZINE COVER** (Time / Forbes / Fast Company)
- Authority framing
- Bold cover-line style headlines
- Clean, professional
- Think: Magazine rack aesthetic

---

You are producing **5 static ads for ONE specific STYLE**: `pro_creative`.

**The 5 angle ad sets test MESSAGE variation.**
**The 2 style ad sets (pro_creative + organic_native) test VISUAL DIVERSITY at the extremes.**

═══ PRODUCT ═══
NAME: [PRODUCT_NAME]
CATEGORY: [CATEGORY]
NICHE: [NICHE]
PRICE: [CURRENCY_SYMBOL][PRICE]

═══ PERSUASION FRAMEWORK CONTEXT ═══
[Same as angle prompt]

═══ AUDIENCE ═══
[AUDIENCE JSON]

═══ MARKETING ═══
[MARKETING JSON]

═══ CAMPAIGN DNA ═══
[CAMPAIGN_DNA_JSON — pro_creative should respect this]

═══ STYLE-SPECIFIC HOOK / CTA seed ═══
HOOK: [HOOK from skeleton]
COPY: [STYLE_COPY_JSON]

# Your job: produce EXACTLY 5 statics for the `pro_creative` style

## Hard rules

1. **Exactly 5 statics**. Match this number exactly.
2. **Pick ONE track** (Editorial/Apple/DTC/Magazine) and stay in it for all 5.
3. **Looks like a $50K campaign** — studio-grade lighting, typographic hierarchy, premium surfaces.
4. **DO NOT generate angle-style statics**. This is a STYLE bet — maximize VISUAL distinctness.
5. **HARD CAP per static: 2 text overlay elements** for pro_creative.
6. **Hero element must occupy 50%+ of frame**.
7. **Awareness target**: lean `problem_aware` / `solution_aware` (mid-funnel).
8. **GPT Image 2 prompt** must follow the §12 template.

## Pro creative specific

- ✅ Pick ONE track appropriate to product category
- ✅ All 5 statics stay within that ONE track
- ✅ Looks like a $50K campaign
- ❌ NO iPhone-handheld aesthetic, NO domestic clutter, NO selfie POV

# Output JSON

[Same structure as angle — static_ads array with 5 objects]
[Use IDs: pr01, pr02, pr03, pr04, pr05]

Return ONLY the JSON object. No prose, no fences, no commentary.
```

---

## Prompt Style — organic_native (User — Étape 8)

```markdown
# WORKED EXAMPLES — quality bar

[Inclure 3-5 exemples de organic_native]

---

# STYLE PLAYBOOK — organic_native

The deliberately RAW extreme. These 5 statics look like REAL Instagram stories / Facebook posts from a 34-year-old normal woman who took the photo on her iPhone in her bathroom at 9pm.

**5 sub-formats (vary across the 5):**

**A. BATHROOM-MIRROR SELFIE**
- Phone visible in mirror corner
- Fluorescent ceiling light overhead
- Toothbrush, crumpled towel visible
- Slight imperfection in framing

**B. CANDID-BY-FRIEND**
- Someone else took the photo
- Caught mid-action
- Slightly awkward angle
- Natural window or ceiling light

**C. STORY-TEXT-OVERLAY**
- iOS Story font
- Handwritten style
- Casual lowercase
- Typos OK

**D. DOMESTIC STILL-LIFE**
- Kitchen counter / bedroom desk
- Product sitting next to coffee, journal, plant
- Natural clutter visible
- No staging

**E. BEFORE/AFTER (real, not screenshot)**
- Real photos, not medical-grade
- Bathroom mirror or bedroom
- Day 1 vs Day 21 energy
- Casual comparison

---

You are producing **5 static ads for ONE specific STYLE**: `organic_native`.

═══ PRODUCT ═══
NAME: [PRODUCT_NAME]
CATEGORY: [CATEGORY]
NICHE: [NICHE]
PRICE: [CURRENCY_SYMBOL][PRICE]

[Same context as pro_creative]

═══ CAMPAIGN DNA ═══
[CAMPAIGN_DNA_JSON — organic_native can BREAK FROM IT freely]

═══ STYLE-SPECIFIC HOOK / CTA seed ═══
HOOK: [HOOK from skeleton]
COPY: [STYLE_COPY_JSON]

# Your job: produce EXACTLY 5 statics for the `organic_native` style

## Hard rules

1. **Exactly 5 statics**.
2. **5 different sub-formats** from the playbook above.
3. **DO NOT generate angle-style statics**. Maximize VISUAL distinctness.
4. **For `organic_native` specifically:**
   - ❌ NO screenshots of ANY kind (no iMessage, no Reddit, no Notes, no push notification)
   - ✅ The image IS the post, not a screenshot of a post
   - ✅ Looks like a real Instagram story / Facebook post from a normal person
   - ✅ Lighting: natural window, ceiling bulb, OR phone flash — NEVER studio
   - ✅ Visible domestic clutter / lived-in environment
   - ✅ Subject styling: weekday-normal — no done makeup, no styled outfit
   - ✅ Composition: deliberately imperfect, slightly off, looks like a snap
5. **HARD CAP per static: 0-1 text overlay element** (handwritten or story-style only).
6. **Hero element must occupy 50%+ of frame**.
7. **Awareness target**: lean `problem_aware` / `solution_aware`.
8. **GPT Image 2 prompt** must follow the §12 template and explicitly state "iPhone front camera, JPEG compression, no studio lighting, no professional retouching, looks like a real instagram story".

# Output JSON

[Same structure as angle — static_ads array with 5 objects]
[Use IDs: og01, og02, og03, og04, og05]

Return ONLY the JSON object. No prose, no fences, no commentary.
```

---

## Données d'Entrée Requises

Pour chaque produit, vous aurez besoin de :

```json
{
  "name": "Nom du produit",
  "category": "Catégorie",
  "niche": "Niche",
  "pricing": {
    "price_cents": 4700,
    "currency": "USD"
  },
  "ai_strategy": "hidden | assumed | neutral",
  "awareness_level": "unaware | problem_aware | solution_aware | product_aware",
  "lf8_primary": "Premier levier LF8",
  "unique_mechanism": "Ce qui différencie ce produit",
  "big_idea": "La big idea en une phrase",
  "value_equation": {
    "dream_outcome": "Outcome rêvé",
    "perceived_likelihood": "Probabilité perçue",
    "time_delay": "Délai",
    "effort_sacrifice": "Effort requis"
  },
  "problem_levels": {
    "external": "Problème externe",
    "internal": "Problème interne",
    "philosophical": "Problème philosophique"
  },
  "audience": {
    "description": "Description de l'audience",
    "demographics": "Démographie"
  },
  "marketing": {
    "hook": "Le hook marketing",
    "value_proposition": "Proposition de valeur"
  },
  "product": {
    "deliverables": "Ce que reçoit l'acheteur",
    "format": "Format du produit"
  },
  "core_result": "Le résultat core",
  "delivery_kind": "digital | physical | ai_api_wrapper",
  "market": "US | FR | BR | etc."
}
```

---

## Options de Personnalisation

### Sélection d'angles spécifiques

```javascript
// Génère seulement 3 angles × 5 = 15 statics
opts.angles = ['problem_aware', 'solution_aware', 'identity'];
```

### Nombre d'ads par bucket

```javascript
opts.perAngle = 3; // Par défaut 5
```

### Formats d'image

```javascript
opts.imageFormats = ['4:5', '1:1', '9:16'];
// Distribue les formats entre les statics
```

### Focus sur 1 bucket

```javascript
// Génère 35 statics dans UN seul bucket
product.focus_angle = 'problem_aware';
opts.totalAds = 35;
```

---

## Garde-fou Devise (Post-Génération)

Après génération, vérifier et corriger la devise dans toutes les copies :

```javascript
function enforceCurrency(brief, expectedSymbol) {
  const suffix = expectedSymbol === '€' || expectedSymbol === 'kr';
  const format = (n) => suffix ? `${n}${expectedSymbol}` : `${expectedSymbol}${n}`;

  // Nettoyer les symboles étrangers
  walk(brief);

  function walk(obj) {
    if (typeof obj === 'string') {
      // Remplacer $ nu par la bonne devise si non-USD
      if (expectedSymbol !== '$') {
        obj = obj.replace(/\$(\d+)/g, (_, n) => format(n));
      }
    }
    if (Array.isArray(obj)) obj.forEach(walk);
    if (obj && typeof obj === 'object') Object.values(obj).forEach(walk);
  }
}
```

---

## Validation du Brief

Après génération, vérifier :

1. **Total = 35 statics** (ou nombre attendu selon options)
2. **Chaque static a** : id, angle, format, hero_element, text_overlay, prompt, primary_text, headline
3. **Prix correct** : seulement le prix officiel, pas de symbole étranger
4. **Formats variés** :尽可能 différents parmi les 12 archetypes
5. **Awareness split** : ~80% unaware/problem_aware, ~20% product_aware

---

## Résumé des Appels

| Étape | Type | Output |
| ------- | ------ | -------- |
| 1 | Skeleton | campaign_dna + hook_map + angle_copy (7 buckets) |
| 2 | problem_aware | 5 statics (IDs: pa01-pa05) |
| 3 | solution_aware | 5 statics (IDs: sa01-sa05) |
| 4 | identity | 5 statics (IDs: id01-id05) |
| 5 | social_proof | 5 statics (IDs: sp01-sp05) |
| 6 | pattern_interrupt | 5 statics (IDs: pi01-pi05) |
| 7 | pro_creative | 5 statics (IDs: pr01-pr05) |
| 8 | organic_native | 5 statics (IDs: og01-og05) |

**Total : 8 appels parallèles, ~60 secondes, 35 statics**

---

## Pour Implémenter

1. **Préparer les données produit** selon la structure ci-dessus

2. **Envoyer le prompt System** avec chaque appel (contient toutes les règles)

3. **Appel 1** : Skeleton avec le prompt user skeleton
   - Parser le JSON retourné
   - Extraire campaign_dna, hook_map, angle_copy

4. **Appels 2-8** : 7 buckets parallèles
   - Chaque bucket utilise le prompt user approprié (angle ou style)
   - Passer le campaign_dna et angle_copy du skeleton
   - Parser le JSON de chaque bucket

5. **Combiner** les résultats en un seul brief avec tous les static_ads

6. **Appliquer le garde-fou devise**

7. **Valider** le brief complet

8. **Générer les images** via GPT Image 2 avec les prompts inclus
