# Second-Hand Marketplace - Use Cases

## UC-01 Register
| Field | Details |
|---|---|
| Actor | Guest User |
| Preconditions | User is not authenticated; email not already registered |
| Primary Flow | 1) User opens register page 2) Enters name, email, and password 3) Submits form 4) System validates input and creates account 5) Success response returned |
| Alternative Flow | A1: Email already exists -> show conflict error. A2: Weak password -> show policy guidance. |
| Post Conditions | Account persisted; user can log in |
| Related FR | FR-001, FR-002, FR-003 |

## UC-02 Login
| Field | Details |
|---|---|
| Actor | Registered User |
| Preconditions | Valid account exists |
| Primary Flow | 1) User enters credentials 2) System authenticates 3) JWT tokens issued 4) User redirected to home/browse page |
| Alternative Flow | A1: Invalid credentials -> 401. A2: Suspended account -> access denied message. |
| Post Conditions | Authenticated session established |
| Related FR | FR-004, FR-005, FR-007 |

## UC-03 Post Listing
| Field | Details |
|---|---|
| Actor | Authenticated Seller |
| Preconditions | User is logged in |
| Primary Flow | 1) Seller clicks "Post Item" 2) Fills in title, description, price, category, condition 3) Uploads one or more images 4) Submits 5) Listing appears in active browse feed |
| Alternative Flow | A1: Missing required fields -> validation error. A2: Image upload failure -> error message with retry option. |
| Post Conditions | New listing stored and visible in browse feed |
| Related FR | FR-009, FR-010, FR-011 |

## UC-04 Edit Listing
| Field | Details |
|---|---|
| Actor | Authenticated Seller |
| Preconditions | Listing exists and is owned by the actor |
| Primary Flow | 1) Seller opens their listing from dashboard 2) Updates fields 3) Saves 4) System returns updated listing state |
| Alternative Flow | A1: Listing not found -> 404. A2: Listing owned by another user -> 403. |
| Post Conditions | Listing updated and changes reflected on detail page |
| Related FR | FR-012, FR-014 |

## UC-05 Browse Listings
| Field | Details |
|---|---|
| Actor | Any User (authenticated or guest) |
| Preconditions | Active listings exist in the system |
| Primary Flow | 1) User opens browse page 2) Listing cards are displayed in a grid 3) User scrolls or paginates through results |
| Alternative Flow | A1: No listings exist -> empty state message shown. |
| Post Conditions | User can view all active listing cards |
| Related FR | FR-019, FR-026, FR-027 |

## UC-06 Search and Filter Listings
| Field | Details |
|---|---|
| Actor | Any User (authenticated or guest) |
| Preconditions | Active listings exist |
| Primary Flow | 1) User enters keyword and/or applies filters (category, condition, price range) 2) System returns matching listings 3) User sorts results if needed |
| Alternative Flow | A1: No matches -> empty state with filter reset option. A2: Invalid filter value -> 400 error. |
| Post Conditions | Filtered and sorted listing results displayed |
| Related FR | FR-020, FR-021, FR-022, FR-023, FR-024, FR-026 |

## UC-07 Send Message to Seller
| Field | Details |
|---|---|
| Actor | Authenticated Buyer |
| Preconditions | User is logged in; listing is active and not owned by buyer |
| Primary Flow | 1) Buyer opens listing detail page 2) Clicks contact button 3) Types message 4) Submits 5) Message stored and visible in seller's inbox |
| Alternative Flow | A1: User not logged in -> redirect to login page. A2: Buyer is listing owner -> contact button not shown. |
| Post Conditions | Message delivered to seller's inbox; conversation thread started |
| Related FR | FR-028, FR-030, FR-037 |

## UC-08 Mark Listing as Sold
| Field | Details |
|---|---|
| Actor | Authenticated Seller |
| Preconditions | Listing is in active status and owned by the actor |
| Primary Flow | 1) Seller goes to their dashboard or listing detail 2) Clicks "Mark as Sold" 3) System updates status to SOLD 4) Listing removed from active browse feed |
| Alternative Flow | A1: Listing already sold -> idempotent success. |
| Post Conditions | Listing status is SOLD; no longer visible in active feed |
| Related FR | FR-015, FR-027 |

## UC-09 View Seller Profile
| Field | Details |
|---|---|
| Actor | Any User (authenticated or guest) |
| Preconditions | Seller account exists |
| Primary Flow | 1) User clicks on seller name from a listing 2) Public profile page loads 3) Seller's name, avatar, and active listings are displayed |
| Alternative Flow | A1: Seller has no active listings -> empty state shown. |
| Post Conditions | Buyer can view seller credibility and their other listings |
| Related FR | FR-032 |

## UC-10 Manage Favorites
| Field | Details |
|---|---|
| Actor | Authenticated Buyer |
| Preconditions | User is logged in; listing is active |
| Primary Flow | 1) Buyer clicks save/heart icon on a listing 2) System adds listing to favorites 3) Listing appears on favorites page |
| Alternative Flow | A1: Buyer clicks again -> listing removed from favorites (toggle). |
| Post Conditions | Favorites list updated; changes persist across sessions |
| Related FR | FR-033, FR-034, FR-035 |
