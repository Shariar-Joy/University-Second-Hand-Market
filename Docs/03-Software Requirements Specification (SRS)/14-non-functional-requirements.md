# Second-Hand Marketplace - Non-Functional Requirements

| NFR ID | Category | Requirement (Measurable Target) |
|---|---|---|
| NFR-001 | Performance | System shall support >= 500 concurrent users with no critical degradation during the MVP phase. |
| NFR-002 | Performance | P95 latency for the listing browse/search API shall be <= 500 ms under normal load. |
| NFR-003 | Performance | Image upload (single image) shall complete within <= 5 seconds under normal network conditions. |
| NFR-004 | Availability | Monthly service availability shall be >= 99.5% (targeting free-tier cloud deployment). |
| NFR-005 | Availability | Planned maintenance downtime shall not exceed 4 hours per month. |
| NFR-006 | Reliability | Failed background jobs (e.g., image uploads) shall surface actionable error messages to the user. |
| NFR-007 | Reliability | No acknowledged write (listing creation, message sent) shall be silently lost. |
| NFR-008 | Scalability | Application shall be deployable on cloud free-tier services (Render/Railway for backend, Vercel/Netlify for frontend) without architectural changes. |
| NFR-009 | Security | All API endpoints except public auth flows and browse/search shall require valid JWT. |
| NFR-010 | Security | Access tokens shall expire in <= 15 minutes; refresh tokens in <= 7 days. |
| NFR-011 | Security | Passwords shall be stored using bcrypt; all data in transit shall use TLS 1.2+. |
| NFR-012 | Security | System shall log authentication failures with timestamps and IP addresses. |
| NFR-013 | Security | Critical vulnerabilities (CVSS >= 9) shall be remediated before any public deployment. |
| NFR-014 | Usability | A first-time user shall be able to post their first listing within <= 5 minutes. |
| NFR-015 | Usability | All forms shall provide inline validation feedback without requiring full page reload. |
| NFR-016 | Accessibility | UI shall be keyboard-navigable for all core flows (register, login, post listing, browse, message). |
| NFR-017 | Maintainability | Backend modules shall maintain unit test coverage >= 70%. |
| NFR-018 | Maintainability | API changes within the same major version shall be backward compatible. |
| NFR-019 | Maintainability | Static code analysis shall pass with no blocker or critical issues before merging to main. |
| NFR-020 | Portability | Application shall run consistently using Docker on any developer machine and the deployment environment. |
| NFR-021 | Portability | All environment-specific configuration shall be managed via environment variables, not hardcoded. |
| NFR-022 | Compliance | User deactivation and data deletion requests shall be processed within 30 days. |
| NFR-023 | Usability | The browse page shall render correctly and be usable on mobile screens >= 375 px wide. |

## NFR Verification Approach
| Category | Verification Method |
|---|---|
| Performance | Load testing with simulated concurrent users on staging |
| Availability | Uptime monitoring during testing and deployment phase |
| Security | Auth abuse tests, JWT expiry tests, password hash inspection |
| Usability | Manual walkthrough testing on mobile and desktop browsers |
| Maintainability | CI test coverage reports and static analysis tools |
| Portability | Docker build and run verification on multiple environments |
