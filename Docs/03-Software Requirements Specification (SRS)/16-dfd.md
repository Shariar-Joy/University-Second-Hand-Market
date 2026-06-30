# Second-Hand Marketplace — Data Flow Diagrams (DFD)

## Context Diagram

```mermaid
flowchart LR
  B[Buyer] -->|Browse, Search, Message Requests| S[Marketplace System]
  SL[Seller] -->|Post, Edit, Mark Sold Requests| S
  S -->|Listings, Messages, Notifications| B
  S -->|Dashboard, Order Status| SL
  S -->|Store / Retrieve Data| DB[(PostgreSQL)]
  S -->|Upload / Serve Images| CS[Cloudinary / Local Storage]
```

## Level 0 DFD

```mermaid
flowchart TD
  B[Buyer]
  SL[Seller]

  P1[1.0 User Management]
  P2[2.0 Listing Management]
  P3[3.0 Browse & Search]
  P4[4.0 Messaging]
  P5[5.0 Image Handling]

  D1[(D1 Users)]
  D2[(D2 Listings)]
  D3[(D3 Messages)]
  D4[(D4 Favorites)]

  B --> P1
  SL --> P1
  B --> P3
  B --> P4
  SL --> P2
  SL --> P4

  P1 <--> D1
  P2 <--> D2
  P2 --> P5
  P3 --> D2
  P4 <--> D3
  P3 --> D4

  P3 --> B
  P2 --> SL
  P4 --> B
  P4 --> SL
```

## Level 1 DFD — Process Decomposition

```mermaid
flowchart TD
  subgraph UM[1.0 User Management]
    UM1[1.1 Register]
    UM2[1.2 Login / Authenticate]
    UM3[1.3 Token Refresh]
    UM4[1.4 Edit Profile]
  end

  subgraph LM[2.0 Listing Management]
    LM1[2.1 Create Listing]
    LM2[2.2 Edit Listing]
    LM3[2.3 Delete Listing]
    LM4[2.4 Mark as Sold]
  end

  subgraph BS[3.0 Browse & Search]
    BS1[3.1 Keyword Search]
    BS2[3.2 Filter by Category / Condition]
    BS3[3.3 Sort by Price / Date]
    BS4[3.4 Pagination]
    BS5[3.5 Save to Favorites]
  end

  subgraph MSG[4.0 Messaging]
    MSG1[4.1 Send Message]
    MSG2[4.2 View Inbox]
    MSG3[4.3 View Conversation Thread]
  end

  subgraph IH[5.0 Image Handling]
    IH1[5.1 Upload Image]
    IH2[5.2 Store / Serve URL]
  end

  DBU[(Users)]:::db
  DBL[(Listings)]:::db
  DBM[(Messages)]:::db
  DBF[(Favorites)]:::db
  STORE[Cloudinary / Local]

  UM1 --> DBU
  UM2 --> DBU
  UM3 --> DBU
  UM4 --> DBU

  LM1 --> DBL
  LM2 --> DBL
  LM3 --> DBL
  LM4 --> DBL
  LM1 --> IH1
  IH1 --> STORE --> IH2 --> DBL

  BS1 --> DBL
  BS2 --> DBL
  BS3 --> DBL
  BS4 --> DBL
  BS5 --> DBF

  MSG1 --> DBM
  MSG2 --> DBM
  MSG3 --> DBM

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```
