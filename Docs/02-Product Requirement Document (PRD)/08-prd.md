# Second-Hand Marketplace - Product Requirements Document (PRD)

## Product Vision
Enable buyers and sellers to trade second-hand goods efficiently through a structured, searchable, and trustworthy web platform with in-platform messaging and seller management tools.

## Problem Statement
Buyers cannot discover second-hand items through fragmented social channels. Sellers have no tools to manage listings, track interest, or communicate privately with buyers.

## Product Goals
| Goal ID | Goal | KPI |
|---|---|---|
| PG-01 | Enable efficient listing discovery | P95 browse/search API latency <= 400 ms |
| PG-02 | Improve buyer-seller communication | >= 60% of messages receive a reply within 24h |
| PG-03 | Minimize listing friction | Time-to-post-listing <= 2 minutes (median) |
| PG-04 | Build a reliable platform | Login success >= 99.5%, uptime >= 99% |

## SMART Requirement Writing Standard
| SMART Element | How It Is Applied |
|---|---|
| Specific | Each requirement states a clear actor, action, and system outcome. |
| Measurable | Each outcome is tied to a KPI, SLA, or testable acceptance criterion. |
| Achievable | Scope is constrained to the semester timeline and solo/small team capacity. |
| Relevant | Each requirement maps to user pain points and business goals (PG-01..PG-04). |
| Timely | Requirements are prioritized by delivery phase and submission milestone. |

## MoSCoW Prioritization
| Category | Definition | Second-Hand Marketplace Usage |
|---|---|---|
| Must Have | Non-negotiable for release success | Auth, listing CRUD, browse/search/filter, mark as sold |
| Should Have | Important but can be delayed if needed | Messaging, seller dashboard, pagination |
| Could Have | Valuable if capacity remains | Favorites, user profiles, notification badge |
| Won't Have (this release) | Explicitly out of scope now | AI price suggestion, payment processing, real-time chat |

## Target Users
Students, young professionals, freelancers, casual buyers and sellers.

## User Personas
See [09-user-personas.md](09-user-personas.md).

## User Journey
See [10-user-journey.md](10-user-journey.md).

## Feature List
| Feature Group | Core Features | Requirement IDs |
|---|---|---|
| Authentication | Register, login, token refresh, logout | FR-001..FR-008 |
| Listing Management | Create, edit, delete, mark as sold | FR-009..FR-013 |
| Listing Details | Title, description, price, category, condition, photos | FR-014..FR-018 |
| Browse & Discovery | Keyword search, filter by category/condition/price, sort, pagination | FR-022..FR-026 |
| Seller Dashboard | My listings, stats, post new item | FR-034..FR-036 |
| Messaging | Send message, inbox, conversation thread per listing | FR-029..FR-033 |
| Favorites | Save/unsave listing, favorites page | FR-037..FR-038 |
| User Profiles | Public seller profile with active listings | FR-040..FR-041 |

## Functional Requirements
See [13-functional-requirements.md](13-functional-requirements.md).

## Non-Functional Requirements
See [14-non-functional-requirements.md](14-non-functional-requirements.md).

## Success Metrics
| Metric | Baseline | Target |
|---|---|---|
| Listings per active seller | 0 | >= 2 |
| Message reply rate | n/a | >= 60% |
| P95 browse API latency | n/a | <= 400 ms |
| Defect leakage (post-submission) | n/a | <= 3 high defects |

## Release Strategy
1. **MVP (Phase 1 — Semester Submission):** Auth, listing CRUD, browse/search/filter, messaging, seller dashboard, favorites.
2. **Phase 2 (Post-Submission):** AI price suggestion, advanced analytics, image moderation.
3. **Phase 3 (Future):** Payment integration, real-time chat, store profiles.

## Roadmap Alignment
Detailed timeline in [27-project-roadmap.md](27-project-roadmap.md).

## Dependencies
| Dependency | Type | Risk |
|---|---|---|
| Cloudinary image hosting | External | Upload size and API limits |
| Railway / Render hosting | Platform | Free tier cold start latency |
| PostgreSQL (managed) | Platform | Schema migration complexity |

## Acceptance Baseline
Each major feature is released only if mapped user stories, FR/NFR, APIs, and test cases are complete and traceable in [25-traceability-matrix.md](25-traceability-matrix.md).
