# Second-Hand Marketplace - Functional Requirements

| FR ID | Description | Priority | Business Justification | Related User Story |
|---|---|---|---|---|
| FR-001 | System shall allow user registration with name, unique email, and password. | High | Enables secure onboarding | US-001 |
| FR-002 | System shall enforce a unique email constraint during account creation. | High | Prevents identity conflicts | US-001 |
| FR-003 | System shall enforce password policy (minimum length, complexity). | High | Reduces account compromise risk | US-001 |
| FR-004 | System shall authenticate users with email/password and issue JWT access token. | High | Enables secure access | US-002 |
| FR-005 | System shall provide a refresh-token endpoint for renewing access tokens. | High | Maintains secure session continuity | US-003 |
| FR-006 | System shall revoke/blacklist refresh token on logout. | High | Prevents session misuse | US-004 |
| FR-007 | System shall restrict access to protected APIs using JWT validation. | High | Protects user data | US-002 |
| FR-008 | System shall allow authenticated users to update their profile (name, phone, avatar). | Medium | Builds trust between buyers and sellers | US-005 |
| FR-009 | System shall allow sellers to create a listing with title, description, price, category, condition, and at least one image. | High | Core seller value delivery | US-008 |
| FR-010 | System shall allow sellers to upload multiple images per listing via Cloudinary or equivalent storage. | High | Improves buyer confidence | US-008, US-013 |
| FR-011 | System shall validate that title, price, category, and condition are required fields when creating a listing. | High | Ensures listing data quality | US-008 |
| FR-012 | System shall allow sellers to edit any field of their own listings. | High | Keeps listing information accurate | US-009 |
| FR-013 | System shall allow sellers to delete their own listings. | Medium | Removes unwanted items from the feed | US-010 |
| FR-014 | System shall prevent sellers from editing or deleting listings owned by other users. | High | Enforces data ownership | US-009, US-010 |
| FR-015 | System shall allow sellers to mark a listing as sold. | High | Closes the selling lifecycle | US-011 |
| FR-016 | System shall provide a seller dashboard listing all listings owned by the authenticated user. | High | Centralizes seller management | US-012 |
| FR-017 | System shall display listings on the seller dashboard grouped by status (active, sold). | High | Improves seller planning | US-012 |
| FR-018 | System shall show basic statistics on the seller dashboard (total listings, active count, sold count). | Medium | Provides seller performance insight | US-014 |
| FR-019 | System shall display all active listings in a paginated grid view on the browse page. | High | Core buyer discovery experience | US-015 |
| FR-020 | System shall provide keyword search across listing title and description. | High | Improves retrieval efficiency | US-016 |
| FR-021 | System shall provide filter by listing category. | High | Supports category-based browsing | US-017 |
| FR-022 | System shall provide filter by listing condition (New, Like New, Good, Fair, Poor). | High | Helps buyers match quality expectations | US-018 |
| FR-023 | System shall provide filter by price range (min and max price inputs). | High | Supports budget-based browsing | US-019 |
| FR-024 | System shall provide sorting by price (ascending/descending) and date posted (newest/oldest). | Medium | Improves result relevance | US-020 |
| FR-025 | System shall provide a listing detail page showing all images, full description, price, condition, category, seller name, and a contact button. | High | Enables informed purchase decisions | US-021 |
| FR-026 | System shall support paginated listing results with total count metadata. | Medium | Preserves performance at scale | US-022 |
| FR-027 | System shall hide sold listings from the main browse feed and search results. | High | Improves buyer experience | US-015 |
| FR-028 | System shall allow authenticated buyers to send a message to a seller from the listing detail page. | High | Enables buyer-seller communication | US-023 |
| FR-029 | System shall provide an inbox page for authenticated users showing all conversations grouped by listing. | High | Centralizes messaging experience | US-024 |
| FR-030 | System shall allow users to view a full conversation thread for each listing. | High | Provides messaging context | US-025 |
| FR-031 | System shall display a notification badge on the inbox icon when new unread messages exist. | Medium | Improves seller response time | US-026 |
| FR-032 | System shall provide a public profile page for each seller showing their name, avatar, and active listings. | Medium | Builds community trust | US-027 |
| FR-033 | System shall allow authenticated users to save a listing to their favorites. | Medium | Enables wishlist functionality | US-028 |
| FR-034 | System shall provide a favorites page showing all saved listings for the authenticated user. | Medium | Enables revisiting of saved items | US-029 |
| FR-035 | System shall allow authenticated users to remove a listing from their favorites. | Low | Keeps favorites list manageable | US-030 |
| FR-036 | System shall display a sold badge on favorited listings that have been marked as sold. | Low | Keeps buyer informed of listing status | US-029 |
| FR-037 | System shall prevent a seller from messaging themselves on their own listing. | Medium | Prevents nonsensical interactions | US-023 |
| FR-038 | System shall enforce per-user API rate limiting on auth and listing creation endpoints. | Medium | Protects system stability | US-002 |
| FR-039 | System shall allow admins to suspend or reactivate user accounts. | Medium | Enables abuse and policy control | US-007 |
| FR-040 | System shall provide a password reset request and token-based reset flow. | High | Enables account recovery | US-006 |
| FR-041 | System shall support user account deactivation with appropriate data retention policy. | Low | Supports lifecycle and compliance | US-007 |

## Requirement Notes
1. FR IDs are baseline-controlled and referenced in use cases, API design, test cases, and the traceability matrix.
2. Implementation prioritizes High requirements for the semester MVP, then Medium/Low by roadmap phase.

## SMART Quality Check for Functional Requirements
| SMART Element | Functional Requirement Quality Rule |
|---|---|
| Specific | Each FR states a clear system behavior with unambiguous language. |
| Measurable | Each FR is testable through acceptance criteria and mapped test cases. |
| Achievable | FR scope aligns with approved architecture and semester delivery timeline. |
| Relevant | Each FR links to at least one user story and business justification. |
| Timely | FR execution is phase-prioritized and release-planned in the project roadmap. |

## MoSCoW Mapping for Functional Requirements
| MoSCoW Category | Priority Mapping | FR Coverage |
|---|---|---|
| Must Have | High | FR-001..FR-007, FR-009..FR-015, FR-019..FR-025, FR-027..FR-030, FR-040 |
| Should Have | Medium | FR-008, FR-016..FR-018, FR-024, FR-026, FR-031..FR-032, FR-037..FR-039 |
| Could Have | Low | FR-035, FR-036, FR-041 |
| Won't Have (this release) | Not in FR baseline | AI price suggestion, real-time chat, payment processing |
