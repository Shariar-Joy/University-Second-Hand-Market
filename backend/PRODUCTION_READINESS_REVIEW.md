# Production Readiness Review

Full review of `backend/` against: security, CORS, cookies, environment
variables, password hashing, authentication, authorization, error handling,
logging, DynamoDB efficiency, API consistency, duplicate code, unused files,
performance, and scalability.

Every issue with a safe, behavior-preserving fix has been fixed and
regression-tested (live against DynamoDB Local, plus an isolated
`TestClient` pass for the new catch-all error handler — see "How this was
verified" at the end). Issues where the "correct" fix would change observable
behavior, require an infrastructure change outside the app, or need your
decision before acting, are documented but **not** changed — flagged clearly
below.

---

## Critical

### 1. `backend/app.db` (SQLite database) was committed to git history — contains password hashes and PII

**Not fixed — needs your decision.** `git log --all -- backend/app.db` shows
it was added in commit `419f4b7`. It's since been deleted from the working
tree and (from the DynamoDB migration) is no longer used by the app at all,
but **the file still exists in git history** and is fully recoverable by
anyone with clone access — including at least one real-looking user record
with a PBKDF2 password hash, email, and student ID.

This can't be fixed by deleting the file again (that only removes it from
future commits, not history) or by re-adding it to `.gitignore` (already
done — irrelevant to what's already committed). Proper remediation requires
rewriting git history (e.g. `git filter-repo --path backend/app.db --invert-paths`
or the BFG Repo Cleaner), which changes every commit hash after `419f4b7` and
requires a force-push plus everyone with a clone re-cloning. That's a
genuinely destructive, hard-to-reverse operation on shared history, so I did
not do it without asking first.

**What I recommend, in order:**
1. Decide if this repo has ever been pushed somewhere others could have
   cloned it. If not, history rewriting is low-risk (just you).
2. If yes, coordinate before rewriting — everyone needs to re-clone or hard
   reset after.
3. Run `git filter-repo --path backend/app.db --invert-paths` (or BFG),
   force-push, have collaborators re-clone.
4. The exposed password hashes are PBKDF2 (not reversible), but if any of
   those test accounts reused that password elsewhere, treat it as
   compromised regardless.

Tell me if you want me to proceed with the history rewrite — I'll walk
through it with you rather than run it unprompted.

### 2. Login timing side-channel leaked whether an email was registered

**Fixed** — `app/api/routes/auth.py`. The old code:
```python
user_row = get_user_by_email(payload.email)
if user_row is None or not verify_password(payload.password, user_row["password_hash"]):
```
Python's `or` short-circuits: `verify_password` (a ~260k/600k-iteration PBKDF2
hash, which takes real, measurable time) only ever ran when the email
existed. So even though both cases returned the identical "Invalid email or
password" message, an attacker could tell them apart purely by measuring
response time. Now a fixed dummy hash is computed once at import and used
whenever the email doesn't exist, so `verify_password` always runs and both
paths cost the same. Verified empirically: before reasoning about it
further, I measured both paths directly — nonexistent-email and
wrong-password-for-a-real-account requests now land in the same ~656–685ms
band (against DynamoDB Local; will be faster against real AWS DynamoDB, but
the important part is they're no longer distinguishable from each other).

### 3. `SECRET_KEY` silently defaults to a well-known insecure value

**Fixed** — `app/main.py` + `app/core/config.py`. If `SECRET_KEY` isn't set
via environment variable, it defaulted to the literal string
`"dev-secret-key-change-me"` — visible in this very repo — with no warning.
Anyone could forge a valid auth cookie for any user ID if this default ever
reached production. Now the app logs a loud warning at startup if this
insecure default is still active:
```
SECRET_KEY is still set to the insecure development default. Auth tokens can
be forged by anyone who reads this codebase. Set a real SECRET_KEY before
deploying (e.g. `openssl rand -hex 32`).
```
This doesn't block startup (would change functionality/availability), just
makes the misconfiguration impossible to miss in logs.

---

## High Priority

### 4. Password hashing below current best-practice iteration count, with no way to raise it later without breaking logins

**Fixed** — `app/core/security.py`. Was PBKDF2-HMAC-SHA256 at 260,000
iterations (OWASP's *old* recommendation) with the count not stored anywhere
— `verify_password` always recomputed using whatever the current global
constant was. That meant simply bumping the constant would have **broken
every existing user's ability to log in** (their hash was computed at the
old count; verification would use the new one and never match) — I checked
for this specifically since it's exactly the kind of "invisible until it
breaks a real user" bug this review is supposed to catch.

Fixed properly: the iteration count is now embedded in the stored hash
(`"600000$<salt>$<digest>"` instead of `"<salt>$<digest>"`), and
`verify_password` reads whichever count is actually in each stored hash.
Old 2-part hashes (implicitly 260,000 iterations) still verify correctly;
new hashes use 600,000 (OWASP's current minimum for PBKDF2-HMAC-SHA256) and
are self-describing, so raising it again later needs no migration.
**Verified against a real pre-existing account** created before this fix —
logged in successfully, confirming backward compatibility isn't just
theoretical.

### 5. Unhandled exceptions returned an inconsistent, non-JSON response

**Fixed** — `app/main.py`. Every *expected* error path
(`HTTPException`, `RequestValidationError`, `DynamoDBError`) already returned
a consistent `{"detail": "..."}` JSON body. But a genuinely unexpected bug
(anything not wrapped in one of those) would fall through to Starlette's
default handler, which returns **plain text**, not JSON — breaking the one
consistency guarantee the rest of the API has, and something a frontend or
monitoring tool parsing `response.json()` wouldn't expect. Added a catch-all
`Exception` handler that logs the full traceback server-side and returns the
same `{"detail": "Something went wrong. Please try again."}` shape as
everything else. Verified with an isolated test (see below) that this
doesn't swallow or change any *existing* `HTTPException` responses — it only
catches what was previously falling through uncaught.

### 6. No rate limiting on `/auth/login` or `/auth/register`

**Not fixed in app code — this is architecturally an infrastructure
concern, not something I should paper over with a fake fix.** There's
nothing stopping unlimited login attempts (brute force / credential
stuffing) or registration spam right now. I deliberately did *not* bolt on
an in-process rate limiter: this API runs on Lambda, where each concurrent
invocation can land on a different, ephemeral container with its own memory
— an in-process counter would not actually limit anything across concurrent
requests in production, while looking like it does. That's worse than no
fix at all.

**Correct fix, for you to configure at deploy time:** API Gateway throttling
(burst/rate limits per route or per API key) or an AWS WAF rate-based rule
in front of the API. Both are documented, standard, and actually work
correctly across Lambda's multi-instance model. Worth doing before this API
is public.

---

## Medium Priority

### 7. No per-request access logging when running on Lambda

**Fixed** — `app/main.py`. Running locally via `uvicorn`, every request is
automatically logged (`INFO: 127.0.0.1 - "GET /api/v1/products HTTP/1.1" 200
OK`) — you've seen this throughout this project. Mangum (the Lambda adapter)
has no equivalent; without it, Lambda's CloudWatch logs would have no
per-request visibility at all — only whatever we happen to log ourselves.
Added middleware that logs `method`, `path`, `status_code`, and duration for
every request (no headers, bodies, or cookies — nothing sensitive), so
Lambda gets the same visibility local dev already had.

### 8. Missing baseline security response headers

**Fixed** — `app/main.py`. Added `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, and `Referrer-Policy: same-origin` to every
response. Cheap, standard, and appropriate even for a pure JSON API (this
API doesn't render HTML, which is why I didn't add a `Content-Security-Policy`
— it wouldn't do anything meaningful here).

### 9. Duplicated scan/seed logic between `db/products.py` and `db/tutors.py`

**Fixed** — extracted `scan_all()` and `seed_if_empty()` into
`app/db/dynamodb.py`; both modules now call the shared helpers instead of
repeating the same pagination-loop and scan-then-batch-write logic
byte-for-byte. Same behavior, less code to keep in sync.

### 10. Duplicated table-creation logic between `_ensure_users_table` and `_ensure_simple_table`

**Fixed** — extracted `_create_table_idempotent()` (the "does it exist? →
create → handle the concurrent-cold-start race → wait for ACTIVE" sequence)
into one shared helper; both functions now just supply their own
`KeySchema`/`AttributeDefinitions`/GSIs. Same behavior, less duplication.

### 11. Product/tutor listing uses `Scan`, which doesn't scale to a large catalog

**Not changed — would require an API-shape change.** `Scan` reads the whole
table every call; fine at the current/expected scale (a curated catalog,
likely never more than a few thousand items), but cost and latency grow
linearly with table size. The real fix (paginated `Query` against a GSI)
would mean the `/products` and `/tutors` endpoints stop returning the full
list in one response — a functional change to the API contract, which you
asked me not to make. Worth revisiting if the catalog grows substantially.

### 12. Single "hot" counter item for user ID generation is a DynamoDB throughput ceiling

**Not changed — would break the `id` field's type contract.** `_next_user_id()`
atomically increments one shared counter item so IDs stay small sequential
integers (matching `UserOut.id: int`, which the frontend also expects).
DynamoDB partitions by key, so a single frequently-written key has a
throughput ceiling — a complete non-issue at any realistic registration
rate for this app, but if registration volume ever became extremely high,
this key would be the bottleneck. The standard alternative (UUIDs) would
change `id` from a small int to a string everywhere it's used, which you
asked me not to do.

### 13. No JWT/session revocation mechanism

**Not changed — standard tradeoff of the current architecture.** Auth is a
single stateless JWT valid up to 30 days (with "remember me"). Logout only
clears the client-side cookie; if a token were somehow copied by an
attacker, it stays valid until it naturally expires — there's no
server-side blocklist. Building one would be a new feature (a
revocation-check on every request, backed by some store), not a bug fix, so
I left it as-is and am noting it as a known limitation rather than silently
changing the auth model.

---

## Low Priority

### 14. Registration reveals whether a specific email/username is already taken

By design (`"An account with this email already exists"` /
`"This username is already taken"` — distinct 409 messages), not a bug. This
is a deliberate, common UX tradeoff (most signup flows do this, since users
need to know whether to log in instead) that was already reviewed and kept
in an earlier pass. Noting it here only because "enumeration via
registration" is a real category worth being aware of — not recommending a
change unless you want one (it would alter registration's error messages).

### 15. CORS `allow_methods`/`allow_headers` use wildcards

`allow_methods=["*"]`, `allow_headers=["*"]` in `app/main.py` are broader
than strictly necessary (only `GET`/`POST` and a couple of headers are
actually used). Not a real vulnerability since the origin allowlist (not a
wildcard) is what actually matters for CORS security, and `allow_credentials`
is correctly paired with an explicit origin list, not `"*"`. Left as-is;
tightening it has no security upside proportional to the risk of breaking
something the frontend needs later.

### 16. No automated test suite

There isn't a `tests/` directory or any `pytest` coverage for this backend —
every check in this review (and prior ones) was done by hand against a live
server. That's a real gap for a "production-ready" label, but writing a full
test suite is a substantial addition beyond this review's scope (and beyond
"fix every issue" in the sense of fixing what exists). Flagging it as a
recommendation, not fixing it here.

---

## Confirmed already correct (no action needed)

Worth stating explicitly so nothing reads as overlooked:

- Route handlers are plain `def`, not `async def` — correct, since boto3 has
  no native async client; FastAPI runs sync handlers in a threadpool so
  blocking DynamoDB calls never block the event loop.
- Auth is fully stateless (JWT + cookie, no server-side session storage) —
  ideal for Lambda's multi-instance, horizontally-scaled execution model.
- The boto3 resource/client is constructed once at module load and reused
  across requests — no reconnect overhead.
- CORS: explicit origin allowlist + `allow_credentials=True` is the correct
  combination (the spec forbids credentials with a wildcard origin, and
  Starlette enforces this).
- Cookies: `HttpOnly` (blocks JS/XSS access), `SameSite=Lax` (blocks
  cross-site POST, i.e. baseline CSRF protection), `Secure` correctly
  configurable per environment.
- Password comparison uses `hmac.compare_digest` (constant-time) — correctly
  avoids a *different* timing side-channel in the comparison itself.
- JWT algorithm is explicitly pinned (`algorithms=[settings.JWT_ALGORITHM]`)
  — no algorithm-confusion vulnerability.
- DynamoDB tables use on-demand (`PAY_PER_REQUEST`) billing — appropriate
  for unpredictable/bursty traffic, no capacity planning needed.
- No secrets or stack traces leak into any error response body (`debug`
  defaults to `False`; all custom error messages are hand-written, generic
  strings, not raw exception text).

---

## How this was verified

- Full regression pass against a live server (DynamoDB Local backing store):
  register, duplicate email/username, login (correct/wrong/nonexistent),
  `/auth/me` (valid/missing cookie), logout, products, tutors, weak-password
  validation — all still return the exact same status codes and bodies as
  before this review.
- Backward-compatible password hashing verified against a *real* pre-existing
  account (not just new registrations).
- Timing side-channel fix verified by directly measuring response times for
  both cases, not just reasoning about the code.
- The new catch-all exception handler verified in isolation via
  `TestClient`, confirming it catches a simulated unexpected `ValueError`
  (→ consistent JSON 500) *and* confirming it does **not** interfere with a
  deliberately-raised `HTTPException` or any real endpoint's normal
  responses.
- CORS (including preflight `OPTIONS`) reconfirmed working correctly with
  the two new middlewares added to the stack.
- `py_compile` across every changed file; no unused imports left behind
  after the deduplication refactor.
