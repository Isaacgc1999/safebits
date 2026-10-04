# Proposal

## Why

safebits is a portfolio project, so recruiters and visitors must be able to try the whole product in seconds, without registering, receiving emails, or touching anyone's real data. After everything is built, the product also needs a final launch pass on production devices, and the DMARC policy must be tightened once real mail has been flowing.

## What Changes

- **Demo at `https://demo.safebits.isaacgarcia.stream`:**
  - the same Angular build in demo mode, served by a third edge environment (Custom Domain) with no API proxy;
  - local-only repositories seeded with a sample household (two people, a planned week, a list and a prep session) and a static public copy of the catalog;
  - core features fully working on the device: planning, swaps, prep, list, receipts, price entry, recipes and cookbook;
  - account, email, publishing, reporting, community prices, export, deletion and admin disabled, with "No disponible en la demo" and a link to the real app;
  - the demo banner on every screen, "Restablecer demo", and an automatic reset 24 hours after the first change;
  - not installable, and not indexed by search engines.
- **Launch:**
  - the full end-to-end journey in es and en on desktop Chrome and Edge, Android Chrome, and an installed iPhone app (including the Google PKCE fallback);
  - a ZAP scan of production;
  - the release checklist;
  - landing-page links to the demo.
- **After launch:** DMARC stage 1 (`quarantine`), then stage 2 (`reject`), each after 14 consecutive clean days of reports, within 8 weeks of the first production email.

## Capabilities

### New Capabilities

- `platform/demo-mode`: the demo address, instant start with sample data, isolation from real data, local changes and reset, available core features, unavailable features explained, the demo banner, not installable or indexed.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–16.
- **Code:**
  - `safebits_front` demo build configuration, `core/demo/` (providers, feature flags, fixture loader, reset) and `assets/demo/`;
  - a `demo` environment in `safebits_edge`;
  - `docs/release-checklist.md` and `docs/email.md` (DMARC log).
- **Completes** the `platform/email-delivery` requirements "Staged DMARC policy" and "Enforced DMARC".
