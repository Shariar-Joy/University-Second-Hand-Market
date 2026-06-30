# Second-Hand Marketplace — Database Design

## Database Overview

| Item | Detail |
|---|---|
| Engine | PostgreSQL |
| Model | Relational (normalized) |
| ORM | SQLAlchemy (Python) |
| Migrations | Alembic |
| Time handling | UTC timestamps stored as `TIMESTAMP WITH TIME ZONE` |

---

## Table Definitions

### `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `full_name` | VARCHAR(120) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(30) | nullable |
| `avatar_url` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

---

### `categories`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE |

Seeded with values such as: Electronics, Clothing, Books, Furniture, Sports, Vehicles, Other.

---

### `listings`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `seller_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `category_id` | INTEGER | NOT NULL, FK → `categories(id)` |
| `title` | VARCHAR(200) | NOT NULL |
| `description` | TEXT | nullable |
| `price` | NUMERIC(12, 2) | NOT NULL |
| `condition` | VARCHAR(20) | NOT NULL — CHECK IN (`new`, `like_new`, `good`, `fair`) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `active` — CHECK IN (`active`, `sold`) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:**
- `idx_listings_seller_id` on `seller_id`
- `idx_listings_category_id` on `category_id`
- `idx_listings_status` on `status`
- `idx_listings_created_at` on `created_at DESC`
- Full-text index on `(title || ' ' || description)` for keyword search (optional — can use `ILIKE` for MVP)

---

### `listing_images`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `listing_id` | INTEGER | NOT NULL, FK → `listings(id)` ON DELETE CASCADE |
| `image_url` | TEXT | NOT NULL |
| `display_order` | SMALLINT | NOT NULL, DEFAULT 0 |

**Index:** `idx_listing_images_listing_id` on `listing_id`

---

### `messages`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `listing_id` | INTEGER | NOT NULL, FK → `listings(id)` ON DELETE CASCADE |
| `sender_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `receiver_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `body` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:**
- `idx_messages_listing_id` on `listing_id`
- `idx_messages_sender_id` on `sender_id`
- `idx_messages_receiver_id` on `receiver_id`

> A "conversation" is retrieved by filtering messages where `listing_id = X AND ((sender_id = A AND receiver_id = B) OR (sender_id = B AND receiver_id = A))`.

---

### `favorites`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `listing_id` | INTEGER | NOT NULL, FK → `listings(id)` ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Unique constraint:** `(user_id, listing_id)` — prevents duplicate saves.

**Index:** `idx_favorites_user_id` on `user_id`

---

## SQLAlchemy Model Sketch

```python
class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Numeric(12, 2), nullable=False)
    condition = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    seller = relationship("User", back_populates="listings")
    category = relationship("Category")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="listing", cascade="all, delete-orphan")
```

---

## Key Access Patterns

| Use Case | Query Strategy |
|---|---|
| Browse active listings with filters | `SELECT * FROM listings WHERE status='active' AND category_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?` |
| Keyword search | `WHERE status='active' AND (title ILIKE '%q%' OR description ILIKE '%q%')` |
| Seller's own listings | `WHERE seller_id = ?` |
| Conversation thread | `WHERE listing_id=? AND (sender_id IN (A,B)) AND (receiver_id IN (A,B))` |
| User's inbox (distinct conversations) | Grouped by `(listing_id, other_party_id)` |
| User favorites | `JOIN favorites ON listings.id = favorites.listing_id WHERE favorites.user_id = ?` |

---

## Sample Data (Category Seed)

```sql
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Clothing & Accessories'),
  ('Books & Stationery'),
  ('Furniture & Home'),
  ('Sports & Outdoors'),
  ('Vehicles & Parts'),
  ('Other');
```

---

## Backup & Security

| Control | Approach |
|---|---|
| Backup | Railway / Render automated daily backups on hosted PostgreSQL |
| Passwords | Stored as bcrypt hashes only — never plaintext |
| Cascade deletes | `ON DELETE CASCADE` ensures orphaned rows are cleaned up automatically |
| Connection | `DATABASE_URL` environment variable; never committed to source control |
