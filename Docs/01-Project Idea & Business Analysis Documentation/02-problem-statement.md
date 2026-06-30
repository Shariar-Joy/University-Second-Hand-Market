# Second-Hand Marketplace - Problem Statement

## Problem Context
Three major user groups are affected by fragmented second-hand trading:

| Segment | Typical Context | Core Frictions |
|---|---|---|
| Students | Selling textbooks, electronics, furniture between semesters | No trusted platform, listings expire on notice boards |
| General Buyers | Looking for affordable used goods locally | Cannot search or filter; waste time on irrelevant posts |
| Casual Sellers | Individuals decluttering household items | No feedback on listing status; no way to track interest |

## Current State (As-Is)
1. Listings are posted in Facebook groups, WhatsApp, or physical boards with no structure.
2. Buyers cannot search by price range, category, or condition.
3. There is no private messaging — contact happens via comments or shared phone numbers.
4. Sellers cannot see which listings are active, sold, or expired.

```mermaid
flowchart LR
  A[Item Available] --> B[Posted in Group Chat / Notice Board]
  B --> C[Buried by New Posts]
  C --> D[Buyer Cannot Find It]
  D --> E[Transaction Never Happens]
```

## Future State (To-Be)
1. Sellers post structured listings with photos, price, category, and condition.
2. Buyers browse and filter listings by category, condition, and price.
3. Messaging is handled within the platform per listing.
4. Sellers manage their full listing lifecycle from a personal dashboard.

```mermaid
flowchart LR
  A[Seller Posts Structured Listing] --> B[Buyer Finds via Search/Filter]
  B --> C[Buyer Sends Message]
  C --> D[Seller Responds]
  D --> E[Transaction Completed]
```

## Business Impact
| Impact Area | Current Cost | Expected Benefit |
|---|---|---|
| Discovery failure | Items go unsold, buyers give up searching | More successful matches |
| Communication overhead | Phone numbers shared publicly, privacy risk | Safe in-platform messaging |
| Seller effort | Manual tracking of interest and availability | Dashboard-based lifecycle management |
| Trust | No proof of item condition or seller history | Structured listing with condition and photos |

## Problem Statement
Students and the general public lack a structured, searchable, and trusted platform for buying and selling second-hand goods locally. This causes missed transactions, privacy risks, and wasted effort. The Second-Hand Marketplace addresses this by providing organized listings, buyer-seller messaging, and seller management tools in one secure web platform.
