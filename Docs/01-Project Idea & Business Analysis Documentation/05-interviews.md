# Second-Hand Marketplace - Interview Report

## Interview Framework
- Format: semi-structured, 20–30 minutes per participant
- Focus: buying/selling behavior, pain points, messaging habits, listing management
- Artifact linkage: findings mapped to US/FR/NFR IDs

## Persona 1 - University Student (Seller)
### Background
Third-year student selling old textbooks and a laptop at the end of semester.

### Questions, Answers, Pain Points, Requirements, Insights
| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you currently sell items? | Facebook group posts and WhatsApp status | Listing gets buried quickly | FR-009, FR-010 | Listings need persistent visibility |
| How do you know if someone is interested? | They comment publicly or DM my personal number | Privacy exposure | FR-029, FR-030 | In-platform messaging is essential |
| How do you track which items are sold? | I remember or delete the post | No tracking system | FR-012, FR-034 | Mark-as-sold and dashboard are needed |

## Persona 2 - Casual Buyer
### Background
Young professional looking for affordable furniture after moving into a new apartment.

| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you find items to buy? | Scroll through Facebook groups manually | No search, wastes time | FR-022, FR-023, FR-025 | Search and category filter are critical |
| What information do you need before buying? | Photos, price, condition, location | Incomplete listings | FR-009, FR-016, FR-017 | All key fields must be structured |
| Do you save listings you like? | I screenshot them | Screenshots are clunky | FR-037, FR-038 | Favorites feature has high user value |

## Persona 3 - Frequent Reseller
### Background
Small reseller who regularly buys in bulk and sells individual items online.

| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How many listings do you manage at once? | 10–20 listings at a time | Chaos with no dashboard | FR-034, FR-035, FR-036 | Dashboard with stats is essential |
| What causes listings to fail? | Item sells offline but listing still shows | Stale listings mislead buyers | FR-012 (mark sold) | Sold status must be easy to set |
| What would most improve your workflow? | Editing listings quickly and bulk management | Edit friction | FR-010, FR-011 | Fast edit and delete are high priority |

## Persona 4 - Graduate Student (Occasional Buyer)
### Background
Graduate student looking for lab equipment and study accessories.

| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| What stops you from buying second-hand? | Can't tell condition from vague descriptions | Lack of condition field | FR-016, FR-017 | Condition (new/good/fair) is a trust signal |
| How do you contact sellers? | I comment on the post and wait | Slow and public | FR-029, FR-031, FR-032 | Private threaded messaging per listing |
| What would help you decide faster? | See seller's other listings | No seller profile | FR-040, FR-041 | Public seller profile with active listings |

## Consolidated Pain Points
1. No searchable, persistent listing platform.
2. No structured listing data (condition, price, category).
3. Messaging is unsafe and public.
4. Sellers have no way to track listing state or buyer interest.

## Requirements Extracted (Top 12)
FR-009, FR-010, FR-012, FR-022, FR-023, FR-024, FR-025, FR-029, FR-030, FR-034, FR-037, FR-040.

## Interview Insight Summary
Users do not need another chat group. They need a purpose-built platform where listings are structured, searchable, and managed — with messaging that protects privacy and keeps conversations organized.
