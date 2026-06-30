# Second-Hand Marketplace - Project Overview

## Executive Summary
Second-Hand Marketplace is a web-based platform for buying and selling used goods among students and the general public. The platform enables sellers to post item listings with photos and details, and buyers to browse, search, and contact sellers — creating a trusted local marketplace experience.

## Project Background
Users currently rely on fragmented channels (Facebook groups, WhatsApp broadcasts, physical notice boards) to buy and sell second-hand items. These channels lack structure, searchability, and trust signals, leading to poor buyer-seller matching and missed transactions.

## Business Problem
Current users face problems because:
1. Listings are scattered across informal channels with no central discovery.
2. Buyers cannot filter or search by category, price, or condition.
3. There is no direct messaging between buyer and seller within a trusted system.
4. Sellers have no dashboard to manage their active, sold, or expired listings.

## Proposed Solution
Deliver a centralized second-hand marketplace with:
- User registration and secure login
- Item listing creation with photos, description, price, category, and condition
- Browse and search with filter/sort capabilities
- Direct buyer-seller messaging per listing
- Seller dashboard for listing management
- React frontend, FastAPI backend, PostgreSQL database, Dockerized deployment

## Project Scope
| In Scope | Description |
|---|---|
| User account lifecycle | Register, login, JWT sessions, profile management |
| Listing management | Create, edit, delete, mark as sold |
| Browse and discovery | Category filter, condition filter, search, sort, pagination |
| Messaging | Buyer-seller conversation thread per listing |
| Seller dashboard | My listings view, stats, post new item |
| Favorites | Save and unsave listings |
| Platform delivery | REST APIs, responsive UI, containerized deployment |

## Stakeholders
| Stakeholder Group | Primary Interest |
|---|---|
| Buyers | Find and contact sellers for items they need |
| Sellers | Post items and manage listings efficiently |
| Product Management | Feature adoption and listing activity metrics |
| Engineering | Build quality and maintainability |
| QA | Reliability and end-to-end flow coverage |
| University Reviewers | Traceable documentation and SDLC completeness |

## Business Value
| Value Driver | Expected Outcome |
|---|---|
| Centralized discovery | Buyers find items faster |
| Structured listings | Higher buyer trust and engagement |
| Messaging system | Faster buyer-seller communication |
| Seller dashboard | Easier listing lifecycle management |

## Success Metrics
| Metric ID | Metric | Target |
|---|---|---|
| SM-01 | Listings created per active user (first month) | >= 2 |
| SM-02 | Message response rate (seller replies within 24h) | >= 60% |
| SM-03 | Listing-to-sold conversion rate | >= 25% |
| SM-04 | P95 browse/search API latency | <= 400 ms |
| SM-05 | Login success rate | >= 99.5% |

## Assumptions
1. Users have reliable internet and modern browsers.
2. Image hosting is handled via Cloudinary or local storage.
3. MVP focuses on single-user listings before team/store features.

## Constraints
| Constraint | Impact |
|---|---|
| Fixed semester timeline (~9 weeks of development) | Strict scope prioritization required |
| Limited initial engineering capacity (solo or small team) | MVP scope only |
| No payment processing in this version | Transactions happen offline |

## Out Of Scope
1. Online payment and checkout (Phase 2).
2. Native mobile apps (web responsive first).
3. AI-based price suggestion (future enhancement after submission).
4. Real-time chat (polling/refresh is sufficient for MVP).
