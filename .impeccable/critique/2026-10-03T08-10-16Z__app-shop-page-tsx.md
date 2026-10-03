---
target: shop home page
total_score: 21
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\User\\OneDrive\\桌面\\coding\\2026\\spot-tea\\app\\(shop)\\page.tsx"
target_fingerprint: 'sha256:8e69be9cc7fc9cabaeb2ae4c03f17da639bd9e6f89d5d2d9c9ec0a8fc21d0c69'
target_path: "C:\\Users\\User\\OneDrive\\桌面\\coding\\2026\\spot-tea\\app\\(shop)\\page.tsx"
timestamp: 2026-10-03T08-10-16Z
slug: app-shop-page-tsx
closed: true
---

# Critique: shop home page app/(shop)/page.tsx (Persuade)

Method: dual-agent. Source-only (no browser tool).

## Design Health Score: 21/40 (Acceptable)

| #   | Heuristic                       | Score | Key Issue                                                                     |
| --- | ------------------------------- | ----- | ----------------------------------------------------------------------------- |
| 1   | Visibility of System Status     | 2     | Mobile cart hidden in the hamburger menu                                      |
| 2   | Match System / Real World       | 3     | Shopping by region is natural; card shows the region twice as type and origin |
| 3   | User Control and Freedom        | 3     | Standard navigation                                                           |
| 4   | Consistency and Standards       | 2     | font-heading undefined; navbar hard-codes bg-white/80                         |
| 5   | Error Prevention                | 2     | 0-item chips; no-image/sold-out cards can't be opened                         |
| 6   | Recognition Rather Than Recall  | 3     | Item counts and clear CTA labels                                              |
| 7   | Flexibility and Efficiency      | 1     | No search on home page or navbar                                              |
| 8   | Aesthetic and Minimalist Design | 2     | Generic; wall-of-text brand paragraph; 7 rows of opening hours                |
| 9   | Error Recovery                  | 2     | Empty DB renders silently; no image fallback                                  |
| 10  | Help and Documentation          | 1     | Footer policy/FAQ links all point to /                                        |

## Design Specificity Verdict

Category-interchangeable shadcn storefront structure. Tea character comes only from the Alishan photo, one terroir line and the Tea館 pun. Mint emerald primary on zero-chroma greys; identical Leaf icon on every region chip; logo used as product image. Missed: the 從平地到高山 altitude scale (坪林 ~400 m → 大禹嶺 ~2,500 m). Detector: 0 findings, clean result verified.

## Priority Issues

- [P1] Mint primary used as price text (~1.6:1 contrast); muted-foreground L0.24 vs foreground L0.20, so hierarchy is flat. Fix: dark tea green for text, mint for fills only, muted L0.50-0.55. Cmd: colorize → audit
- [P1] font-heading undefined in @theme; Noto_Serif latin-only, so CJK falls back to the OS font. Fix: Noto Serif TC for headings, define --font-heading. Cmd: typeset
- [P1] ProductCard: only the image is a link; no-image cards have no link; sold-out overlay blocks clicks; h2 nested under h2. Fix: stretched title link, pointer-events-none overlay, h3. Cmd: harden
- [P1] No trust layer (free shipping over NT$1,500 exists in code but isn't shown; ECPay, Taichung shop, returns absent); footer links point to /; no tel:/mailto:. Fix: trust strip under hero; build or remove policy pages. Cmd: clarify
- [P2] Generic composition; terroir story untold. Fix: altitude-band region strip (needs categories.altitude); rewrite brand copy as a customer promise. Cmd: shape → bolder

## Persona Red Flags

Casey: cart hidden on mobile, 36px CTAs, only the image is tappable, low-contrast price, 14-line opening hours. Jordan: identical region icons, duplicated type/origin label, two CTAs of equal weight. Riley: 0-item chips, dead cards, unclamped names, empty-DB state, 99+ badge, full catalogue loaded to show 4 products.

## Minor Observations

site-container lg:max-w-3xl leaves laptops in a narrow column; hero Image has no sizes; English logo alt text; header/footer landmark semantics; outline-ring/50 nearly invisible; no reduced-motion on hover scale; gap-8 + space-y-8 doubled; stiff brand copy.

## Questions

Make the page an altitude climb? Why no search for a brand named 找茶? What does the shop know about its tea (harvest season, roast, brewing temperature) that belongs above the fold?
