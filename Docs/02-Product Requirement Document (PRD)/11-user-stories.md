# Second-Hand Marketplace - User Stories

## Epic E1 - Authentication and Account Management
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-001 | E1 | Registration | As a user, I want to register with email and password so that I can create a personal marketplace account. | High | FR-001, FR-002, FR-003 |
| US-002 | E1 | Login | As a user, I want to log in securely so that I can access my listings and messages. | High | FR-004, FR-007 |
| US-003 | E1 | Session Continuity | As a user, I want token refresh so that I stay logged in safely without interruption. | High | FR-005 |
| US-004 | E1 | Logout | As a user, I want to log out so that my account stays secure on shared devices. | High | FR-006 |
| US-005 | E1 | Profile | As a user, I want to update my profile (name, phone, avatar) so that buyers and sellers can identify me. | Medium | FR-008 |
| US-006 | E1 | Password Recovery | As a user, I want a password reset option so that I can recover account access if I forget my password. | High | FR-040 |
| US-007 | E1 | Account Deactivation | As a user, I want to deactivate my account so that I can stop using the service when needed. | Low | FR-041 |

## Epic E2 - Listing Management (Seller)
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-008 | E2 | Create Listing | As a seller, I want to create a listing with images, title, description, price, category, and condition so that buyers can find my item. | High | FR-009, FR-010, FR-011 |
| US-009 | E2 | Edit Listing | As a seller, I want to edit my listing so that I can update details like price or description after posting. | High | FR-012 |
| US-010 | E2 | Delete Listing | As a seller, I want to delete a listing so that items I no longer want to sell are removed. | Medium | FR-013 |
| US-011 | E2 | Mark as Sold | As a seller, I want to mark a listing as sold so that buyers stop contacting me about it. | High | FR-015 |
| US-012 | E2 | My Listings Dashboard | As a seller, I want a dashboard showing all my listings with their status so that I can manage them in one place. | High | FR-016, FR-017 |
| US-013 | E2 | Image Upload | As a seller, I want to upload multiple images for a listing so that buyers can see the item clearly. | High | FR-010 |
| US-014 | E2 | Listing Stats | As a seller, I want to see basic stats (total listings, active vs sold count) on my dashboard so that I can track my selling activity. | Medium | FR-018 |

## Epic E3 - Browsing and Discovery (Buyer)
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-015 | E3 | Browse Listings | As a buyer, I want to browse all active listings in a grid view so that I can discover items available for sale. | High | FR-019 |
| US-016 | E3 | Search Listings | As a buyer, I want to search listings by keyword so that I can find specific items quickly. | High | FR-020 |
| US-017 | E3 | Filter by Category | As a buyer, I want to filter listings by category so that I can browse items relevant to my interest. | High | FR-021 |
| US-018 | E3 | Filter by Condition | As a buyer, I want to filter listings by condition (new, like new, used, etc.) so that I can match my quality expectations. | High | FR-022 |
| US-019 | E3 | Filter by Price | As a buyer, I want to filter listings by price range so that I can stay within my budget. | High | FR-023 |
| US-020 | E3 | Sort Listings | As a buyer, I want to sort listings by price or date posted so that I can prioritize the most relevant results. | Medium | FR-024 |
| US-021 | E3 | Listing Detail Page | As a buyer, I want to view a full listing detail page so that I can read the full description, see all images, and contact the seller. | High | FR-025 |
| US-022 | E3 | Pagination | As a buyer, I want paginated listing results so that the page loads fast even with many listings. | Medium | FR-026 |

## Epic E4 - Messaging
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-023 | E4 | Send Message | As a buyer, I want to send a message to a seller from the listing page so that I can ask questions or negotiate. | High | FR-028 |
| US-024 | E4 | Inbox (Seller) | As a seller, I want an inbox showing all conversations so that I can respond to interested buyers. | High | FR-029 |
| US-025 | E4 | Conversation Thread | As a user, I want to view a full conversation thread per listing so that I have context of all prior messages. | High | FR-030 |
| US-026 | E4 | Message Notifications | As a seller, I want a notification badge for new messages so that I am aware of buyer enquiries. | Medium | FR-031 |

## Epic E5 - User Profiles and Favorites
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-027 | E5 | Public Profile | As a buyer, I want to view a seller's public profile and their active listings so that I can assess their credibility. | Medium | FR-032 |
| US-028 | E5 | Save Favorite | As a buyer, I want to save a listing to favorites so that I can revisit it later. | Medium | FR-033 |
| US-029 | E5 | Favorites Page | As a buyer, I want a dedicated favorites page in my dashboard so that I can view all saved listings. | Medium | FR-034 |
| US-030 | E5 | Remove Favorite | As a buyer, I want to unsave a listing from favorites so that I can keep my saved list clean. | Low | FR-035 |

## Coverage Note
All user stories are mapped to one or more functional requirements. Full end-to-end mapping is maintained in [25-traceability-matrix.md](25-traceability-matrix.md).
