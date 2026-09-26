# DATA_SOURCE.md

## Where this data comes from
All scheme and channel-partner data in `verified_schemes_seed.json` and
`verified_partners_seed.json` was retrieved directly from the **official NSFDC
website** (nsfdc.nic.in), a Public Sector Undertaking under the **Ministry of
Social Justice and Empowerment, Government of India**, on **2026-09-04**.

Primary pages used:
- Scheme details & loan terms: https://nsfdc.nic.in/scheme
- Eligibility criteria: https://nsfdc.nic.in/eligibility-requirements
- Application process: https://nsfdc.nic.in/how-to-apply-2
- Channel partners (State Channelizing Agencies list, PDF): https://nsfdc.nic.in/our-channel-partners

No aggregator, blog, or third-party site (e.g. loan-comparison sites) was used
as a source for any field — every number traces to an NSFDC-published page.

## What is verified vs. unavailable

**Verified (`data_status: "verified"`):**
- All 5 scheme records: name, purpose, project cost bands, loan limits,
  interest rates, repayment periods, moratorium periods
- Shared eligibility rules: SC category requirement, ₹5 lakh annual family
  income ceiling (effective 7 Jan 2026), eligible entity types
- Official application route: PM-SURAJ portal (pmsuraj.dosje.gov.in)
- 38 State Channelizing Agencies: real names, states, and postal addresses

**Unavailable (`data_status: "unavailable"`) — do not fill these in:**
- **Per-scheme document checklists.** NSFDC's public site only confirms three
  general categories (caste certificate, income proof, KYC documents) and
  states the rest of the checklist is maintained individually by each SCA/CA.
  There is no official NSFDC-published itemized document list per scheme.
- **Partner geo-coordinates (latitude/longitude).** NSFDC publishes addresses
  only, not coordinates. These must be generated via a proper geocoding step
  (see below) — never hand-guessed.
- **Individual SCA branch offices, PSBs, RRBs, NBFC-MFIs, Cooperative Banks,
  SFBs, and Cooperative Societies.** NSFDC publishes these as 7 *separate*
  PDF lists at the same channel-partners page. Only the State Channelizing
  Agencies (SCA) list has been transcribed into `verified_partners_seed.json`
  so far — the other 7 categories exist as real official PDFs but have not
  yet been converted to structured data in this pass.
- **Per-partner supported-scheme mapping.** SCAs generically channelize all 5
  NSFDC credit schemes for their state; there is no official document mapping
  a specific SCA to a specific scheme subset, so `supported_schemes` should be
  treated as `"all_nsfdc_schemes"` rather than invented per-partner.

## How to add geo-coordinates without guessing
1. Take the `address` field for each partner in `verified_partners_seed.json`.
2. Run it through a real geocoding API (e.g. the same map provider already
   configured for the Partner Locator phase).
3. Store the returned lat/lng with a `geocoded_at` timestamp and
   `geocode_source` field, and keep `data_status` for the address itself as
   `"verified"` but flag the coordinates as `"geocoded"` (distinct from
   `"verified"`) so it's clear the point-on-map is a derived estimate, not an
   NSFDC-published fact.
4. Spot-check a handful of results manually — automated geocoding on Indian
   government building addresses is not always accurate.

## How to expand this dataset later
- To add the remaining 7 channel-partner categories (PSBs, RRBs, NBFC-MFIs,
  Cooperative Banks, SFBs, SIDBI, Cooperative Societies): fetch each PDF
  listed at https://nsfdc.nic.in/our-channel-partners and transcribe using
  the same schema and the same honesty rules as this document.
- To add more schemes beyond NSFDC (e.g. state-level SC welfare schemes):
  apply the same standard — primary government source only, every field
  traceable to a specific page/document, `data_status: "unavailable"` for
  anything not explicitly published.
- Check nsfdc.nic.in periodically for updates — loan limits and interest
  rates are revised periodically (the site itself notes the income ceiling
  changed effective 7 Jan 2026, and loan limits have been revised multiple
  times historically).

## How verification dates should be maintained
- `last_verified_at` = the date a human or agent last confirmed the field
  against the live official page — not the date the record was first typed
  into the database.
- Before demo day, do one final manual pass against nsfdc.nic.in to confirm
  nothing has changed, and update `last_verified_at` accordingly.
- If a field can no longer be confirmed against the live site (page removed,
  restructured, etc.), change its `data_status` to `"unavailable"` rather
  than leaving a stale `"verified"` label on it.

## Validation rule for the application (must be enforced in code, not just
## documentation)
Any field with `data_status` of `"unavailable"` or `"synthetic"` must be
either hidden in the UI or explicitly labeled as such wherever it's rendered
(scheme details, document checklist, partner locator, AI assistant answers).
It must never be displayed as if it carries the same authority as a
`"verified"` field. This should be a runtime check (e.g. a UI component that
refuses to render a value without also rendering its status badge when
status ≠ verified), not just a convention developers are expected to
remember.
