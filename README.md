# Intelligent Economics — working tree

This is a working tree for **Intelligent Economics** interactive derivations.

The paper *derives*. The book *names* (*The Last Economy*). This repository re-derives the paper's recoveries interactively. It is not a rewrite of the book, not a textbook, and not Common Wealth. Residual human value stays open: the paper leaves that question to the community.

Official objects (read those; this tree only re-derives):

- **Paper** (May 2026, 40pp, Emad Mostaque)
  - https://webstatics.ii.inc/microsites/common-wealth/pdfs/intelligent-economics.pdf
  - https://thesis.ii.inc/papers/intelligent-economics.pdf
- **Site:** https://ie.ii.inc
- **Book:** https://thelasteconomy.com — do not copy book text

See [sources.md](sources.md) for what is and is not included.

## Status tags

| Tag | Meaning |
| --- | --- |
| `forced` | Recovery forced by the paper's uniqueness chain |
| `identified` | Structural identification; setting-specific construction remains inheritance |
| `notes` | Notes only — no interactive page yet |
| `absent` | Not in this tree |

Notes-only and absent fields stay off this site.

## Add order

1. **Demand / Slutsky, logit, producer** — `forced`, already live on ie.ii.inc / paper Table 3 and §6.1
2. **Clearing, welfare, Nash** — `forced`, Table 3 / Fig. 7 / Part IV / film III
3. **Discounting** — `forced`
4. **Akerlof, Euler, Coase** (this commit) — Akerlof and Coase `identified` (§6.1 / Fig. 6; §6.2 / site slider); Euler `forced` (Table 3)
5. **Stubs**: contracts, mechanism design, matching, growth, money — `identified`
6. Notes-only and absent fields stay off

## Open locally

Open `index.html` in a browser (or any static host). Cloudflare Pages can publish the repo root as-is. Math is KaTeX from a CDN; no build step.

```
open index.html
```

Or:

```
python3 -m http.server 8080
```

then visit `http://localhost:8080/`.

## This tree

| Path | Status |
| --- | --- |
| [derivations/demand.html](derivations/demand.html) | forced |
| [derivations/logit.html](derivations/logit.html) | forced |
| [derivations/producer.html](derivations/producer.html) | forced |
| [derivations/clearing.html](derivations/clearing.html) | forced |
| [derivations/welfare.html](derivations/welfare.html) | forced |
| [derivations/akerlof.html](derivations/akerlof.html) | identified |
| [derivations/nash.html](derivations/nash.html) | forced |
| [derivations/euler.html](derivations/euler.html) | forced |
| [derivations/discounting.html](derivations/discounting.html) | forced |
| [derivations/coase.html](derivations/coase.html) | identified |
| [derivations/contracts.html](derivations/contracts.html) | identified — stub |
| [derivations/mechanism-design.html](derivations/mechanism-design.html) | identified — stub |
| [derivations/matching.html](derivations/matching.html) | identified — stub |
| [derivations/growth.html](derivations/growth.html) | identified — stub |
| [derivations/money.html](derivations/money.html) | identified — stub |

No pages for tax/ETI, Solow, cycles, public goods, IV, unemployment, open economy, CAPM, term structure, development, gravity, crypto, or fiscal theory.
