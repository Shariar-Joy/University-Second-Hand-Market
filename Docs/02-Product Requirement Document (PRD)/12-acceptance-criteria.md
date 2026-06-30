# Second-Hand Marketplace - Acceptance Criteria

## Feature-Level Gherkin Acceptance Criteria

### AC-01 Registration (FR-001..FR-003)
- **Given** a new user on the registration page, **when** valid name, email, and password are submitted, **then** the account is created and a success response is returned.
- **Given** an already-registered email, **when** the user attempts registration, **then** the system returns `409 CONFLICT` with a clear error message.
- **Given** a password that does not meet the policy, **when** the user submits registration, **then** the system rejects the request with validation details.

### AC-02 Login and JWT Session (FR-004..FR-007)
- **Given** valid credentials, **when** the user logs in, **then** access and refresh tokens are issued.
- **Given** invalid credentials, **when** login is attempted, **then** the system returns `401 UNAUTHORIZED`.
- **Given** an expired access token and a valid refresh token, **when** the refresh endpoint is called, **then** a new access token is issued.
- **Given** a user calls a protected endpoint without a token, **when** the request is processed, **then** the system returns `401 UNAUTHORIZED`.

### AC-03 Create and Edit Listing (FR-009..FR-013)
- **Given** an authenticated seller, **when** all required listing fields are submitted with at least one image, **then** the listing is persisted and appears in the browse feed.
- **Given** an existing listing owned by the seller, **when** fields such as price, description, or condition are updated, **then** the changes are saved and reflected in the listing detail page.
- **Given** a listing with missing title or price, **when** the seller submits the form, **then** the system returns a validation error and does not create the listing.

### AC-04 Listing Status Lifecycle (FR-014..FR-017)
- **Given** an active listing, **when** the seller marks it as sold, **then** the status becomes `SOLD` and it is removed from the active browse feed.
- **Given** a seller's dashboard, **when** it loads, **then** listings are grouped by status (active, sold) with accurate counts.

### AC-05 Browse, Search, and Filter (FR-019..FR-026)
- **Given** active listings exist, **when** a buyer opens the browse page, **then** listings are displayed in a grid of cards with image, title, price, and condition.
- **Given** a search keyword, **when** the buyer searches, **then** only listings with matching titles or descriptions are returned.
- **Given** category, condition, or price range filters are applied, **when** the buyer submits the filter, **then** only listings matching all active filters are shown.
- **Given** a dataset larger than the page size, **when** the buyer navigates to page N, **then** paginated metadata and the correct page of listings are returned.

### AC-06 Listing Detail Page (FR-025)
- **Given** an active listing, **when** a buyer opens the listing detail page, **then** all images, full description, price, seller name, and a contact button are displayed.
- **Given** a sold listing, **when** any user opens the detail page, **then** a "sold" badge is shown and the contact button is hidden.

### AC-07 Messaging (FR-028..FR-031)
- **Given** a buyer on a listing detail page, **when** they send a message, **then** the message is stored and appears in the seller's inbox.
- **Given** a seller's inbox, **when** it loads, **then** all conversations are listed grouped by listing with the most recent message shown.
- **Given** a conversation thread, **when** the user opens it, **then** all messages in that conversation are shown in chronological order.
- **Given** a new message arrives for the seller, **when** the page is loaded or refreshed, **then** a notification badge appears on the inbox icon.

### AC-08 Favorites (FR-033..FR-035)
- **Given** an authenticated buyer, **when** they save a listing, **then** the listing appears on their favorites page.
- **Given** a saved listing, **when** the buyer removes it from favorites, **then** it no longer appears on the favorites page.
- **Given** a listing that has been marked as sold, **when** it is viewed on the favorites page, **then** a sold badge is displayed on the card.

### AC-09 Public Profile (FR-032)
- **Given** a buyer views a seller's public profile, **when** the page loads, **then** the seller's name, avatar, and all active listings are displayed.
- **Given** a seller with no active listings, **when** their profile is viewed, **then** an empty state message is shown.
