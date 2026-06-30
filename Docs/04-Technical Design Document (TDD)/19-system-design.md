# Second-Hand Marketplace — System Design

## High-Level Design

The marketplace follows a standard three-tier, API-first web architecture:

1. **Presentation Layer:** React SPA (served via Vercel / Netlify).
2. **Application Layer:** Python FastAPI backend providing RESTful endpoints.
3. **Data Layer:** PostgreSQL relational database accessed via SQLAlchemy ORM.
4. **Storage Layer:** Cloudinary (or local filesystem) for listing images.

---

## Architecture Diagram

```mermaid
flowchart LR
  User[Browser / Mobile] --> FE[React SPA]
  FE -->|REST API calls via HTTPS| API[FastAPI Backend]
  API --> DB[(PostgreSQL)]
  API --> IMG[Cloudinary / Local Storage]
  API --> AUTH[JWT Auth Module]
```

---

## Component Diagram

```mermaid
flowchart TD
  subgraph Frontend[React Frontend]
    F1[Auth Pages - Login / Register]
    F2[Browse Page - Grid, Search, Filters]
    F3[Listing Detail Page]
    F4[Seller Dashboard]
    F5[Inbox & Message Thread]
    F6[Favorites Page]
    F7[Public Seller Profile]
  end

  subgraph Backend[FastAPI Backend]
    B1[Auth Router]
    B2[Listings Router]
    B3[Categories Router]
    B4[Messages Router]
    B5[Favorites Router]
    B6[Users Router]

    S1[Auth Service]
    S2[Listing Service]
    S3[Message Service]
    S4[User Service]

    M1[SQLAlchemy Models]
  end

  F1 --> B1 --> S1 --> M1
  F2 --> B2 --> S2 --> M1
  F3 --> B2
  F4 --> B2
  F5 --> B4 --> S3 --> M1
  F6 --> B5 --> M1
  F7 --> B6 --> S4 --> M1
  B2 --> IMG
```

---

## Data Flow — Posting a Listing

```mermaid
sequenceDiagram
  participant Seller
  participant UI as React UI
  participant API as FastAPI
  participant IMG as Image Storage
  participant DB as PostgreSQL

  Seller->>UI: Fill listing form + upload images
  UI->>API: POST /api/v1/listings (multipart)
  API->>IMG: Upload image files
  IMG-->>API: Image URLs
  API->>DB: INSERT listing + listing_images rows
  DB-->>API: listing_id
  API-->>UI: 201 Created { listing_id }
  UI-->>Seller: Redirect to listing detail page
```

---

## Data Flow — Buyer Sends a Message

```mermaid
sequenceDiagram
  participant Buyer
  participant UI as React UI
  participant API as FastAPI
  participant DB as PostgreSQL

  Buyer->>UI: Type message on listing detail page
  UI->>API: POST /api/v1/messages
  API->>DB: INSERT message row
  DB-->>API: message_id
  API-->>UI: 201 Created
  UI-->>Buyer: Message appears in thread
```

---

## Security Architecture

| Layer | Control |
|---|---|
| Identity | JWT access token + optional refresh token |
| API | Route-level authorization (owner-only checks for edit/delete) |
| Data | Passwords hashed with bcrypt |
| Transport | HTTPS / TLS in production |
| Input | Pydantic request validation on all endpoints |

---

## Deployment Architecture

```mermaid
flowchart TD
  subgraph Cloud
    FE_HOST[Vercel / Netlify - React SPA]
    BE_HOST[Railway / Render - FastAPI]
    DB_HOST[Railway / Render / Supabase - PostgreSQL]
    IMG_HOST[Cloudinary - Image CDN]
  end

  Browser --> FE_HOST
  FE_HOST -->|API calls| BE_HOST
  BE_HOST --> DB_HOST
  BE_HOST --> IMG_HOST
```

All services use free-tier hosting suitable for academic project submission and demo.

---

## Scalability Notes (Future / Post-submission)

| Concern | Approach |
|---|---|
| Image optimization | Cloudinary transformation URLs for resizing on-the-fly |
| Search performance | Add PostgreSQL full-text search index on title + description |
| Real-time messaging | Upgrade to WebSocket or Server-Sent Events in a future version |
| Caching | Add Redis cache for browse page results in a future version |
