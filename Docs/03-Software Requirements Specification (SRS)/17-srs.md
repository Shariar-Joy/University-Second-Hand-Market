# Second-Hand Marketplace — Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This SRS defines functional and non-functional requirements for the Second-Hand Marketplace — a web application that allows users to post, browse, and purchase second-hand goods, and communicate directly between buyer and seller.

### 1.2 Scope
The system supports secure user registration and login, full listing lifecycle management, image uploads, buyer–seller messaging, a seller dashboard, and a favorites system. The technology stack is React (frontend), Python FastAPI (backend), and PostgreSQL with SQLAlchemy (database).

### 1.3 Definitions and Acronyms
| Term | Meaning |
|---|---|
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| JWT | JSON Web Token |
| SRS | Software Requirements Specification |
| CRUD | Create, Read, Update, Delete |

### 1.4 References
- ERD: [18-erd.md](18-erd.md)
- System Design: [19-system-design.md](19-system-design.md)
- Database Design: [21-database-design.md](21-database-design.md)
- API Design: [22-api-design.md](22-api-design.md)

---

## 2. Overall Description

### 2.1 Product Perspective
The Second-Hand Marketplace is a three-tier web system:
1. **React** frontend SPA for buyer and seller interaction.
2. **Python FastAPI** backend providing REST API endpoints and business logic.
3. **PostgreSQL** relational database managed via SQLAlchemy ORM.

### 2.2 Product Functions
- User registration, login, JWT-based session management, and profile editing.
- Listing creation, editing, deletion, and mark-as-sold lifecycle.
- Image upload and serving (Cloudinary or local storage).
- Browse page with keyword search, category/condition filters, and sort options.
- Pagination on listing browse results.
- Direct buyer–seller messaging per listing (polling-based, no real-time required).
- Seller dashboard: active/sold listings overview, stats, post-new-item form.
- Favorites: save and unsave listings, view favorites list.
- Public seller profile page showing active listings.

### 2.3 User Classes
| Class | Description |
|---|---|
| Buyer | Browses listings, contacts sellers, saves favorites |
| Seller | Posts listings, manages dashboard, responds to messages |
| Buyer-Seller | Same user acting in both roles (accounts are shared) |

### 2.4 Operating Environment
- Modern web browsers (Chrome, Firefox, Edge, Safari).
- Backend on any Linux runtime (local or cloud: Railway / Render free tier).
- Frontend deployed on Vercel or Netlify.
- PostgreSQL hosted on Railway / Render / Supabase (free tier).

### 2.5 Constraints
- JWT-based auth is mandatory.
- No real-time WebSocket messaging in MVP; polling or manual refresh is acceptable.
- No payment gateway in MVP.
- No AI features in MVP.
- Deployment must be achievable on free-tier cloud services.

### 2.6 Assumptions and Dependencies
- Cloudinary free tier (or local file storage) is available for image uploads.
- Users have a stable internet connection for image uploads.

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
| ID | Requirement |
|---|---|
| FR-001 | A user shall be able to register with full name, email, and password. |
| FR-002 | The system shall hash passwords before storage. |
| FR-003 | A user shall be able to log in with email and password and receive a JWT access token. |
| FR-004 | The system shall support JWT token refresh. |
| FR-005 | A logged-in user shall be able to update their profile (name, phone, avatar). |
| FR-006 | Protected endpoints shall reject requests without a valid Bearer token. |

### 3.2 Listing Management
| ID | Requirement |
|---|---|
| FR-007 | A seller shall be able to create a listing with title, description, price, category, condition, and up to 5 images. |
| FR-008 | The system shall store uploaded images and return a public URL. |
| FR-009 | A seller shall be able to edit any field of their own listing. |
| FR-010 | A seller shall be able to delete their own listing. |
| FR-011 | A seller shall be able to mark a listing as "sold". |
| FR-012 | Only the listing owner shall be permitted to edit, delete, or mark sold. |

### 3.3 Browse & Search
| ID | Requirement |
|---|---|
| FR-013 | The browse page shall display all active (unsold) listings as a grid of cards. |
| FR-014 | Users shall be able to search listings by keyword (title and description). |
| FR-015 | Users shall be able to filter listings by category. |
| FR-016 | Users shall be able to filter listings by condition (new, like new, good, fair). |
| FR-017 | Users shall be able to sort listings by price (ascending/descending) or date posted. |
| FR-018 | The browse page shall support pagination or infinite scroll. |
| FR-019 | Clicking a listing card shall open a listing detail page. |

### 3.4 Messaging
| ID | Requirement |
|---|---|
| FR-020 | A buyer shall be able to send a message to a seller about a specific listing. |
| FR-021 | A user shall be able to view their inbox listing all conversations. |
| FR-022 | A user shall be able to view the full message thread per listing. |
| FR-023 | No real-time delivery is required; polling or manual refresh is sufficient. |

### 3.5 Seller Dashboard
| ID | Requirement |
|---|---|
| FR-024 | A seller shall have a dashboard showing their active listings, sold listings, and total counts. |
| FR-025 | The dashboard shall include a form to post a new listing. |
| FR-026 | The dashboard shall allow inline edit and delete of their listings. |

### 3.6 Favorites
| ID | Requirement |
|---|---|
| FR-027 | A logged-in user shall be able to save a listing to their favorites. |
| FR-028 | A user shall be able to unsave a listing from favorites. |
| FR-029 | A user shall be able to view all their saved favorites on a dedicated page. |

### 3.7 Public Seller Profile
| ID | Requirement |
|---|---|
| FR-030 | Any user shall be able to view a seller's public profile page. |
| FR-031 | The public profile shall display the seller's name, avatar, and active listings. |

---

## 4. Non-Functional Requirements

| ID | Attribute | Requirement |
|---|---|---|
| NFR-001 | Performance | API responses shall complete within 1 second under normal load. |
| NFR-002 | Scalability | The system shall handle at least 100 concurrent users during demo/testing. |
| NFR-003 | Availability | The deployed system shall target 99% uptime on free-tier hosting. |
| NFR-004 | Security | Passwords shall be hashed with bcrypt. |
| NFR-005 | Security | All API endpoints shall use HTTPS in production. |
| NFR-006 | Security | Users shall only be permitted to modify their own data. |
| NFR-007 | Usability | The UI shall be responsive and usable on mobile and desktop browsers. |
| NFR-008 | Maintainability | Backend code shall be organized into routers, services, and models layers. |
| NFR-009 | Portability | The application shall be deployable to Railway, Render, Vercel, or Netlify without code changes. |

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Responsive React SPA; works on desktop and mobile browsers.
- Listing grid with cards, search bar, filter panel, and sort dropdown.
- Seller dashboard with stats and listing management table.

### 5.2 Software Interfaces
- REST API over HTTPS, JSON payloads.
- JWT Bearer token authentication.
- Cloudinary REST API (or multipart form upload to local storage) for images.

### 5.3 Communication Interfaces
- HTTPS / TLS for all client–server communication.
- JSON request and response bodies.

---

## 6. Assumptions and Constraints
1. No payment or escrow features are in scope for MVP.
2. No real-time chat; polling is acceptable.
3. No AI features in this version.
4. A single PostgreSQL database serves all entities.
