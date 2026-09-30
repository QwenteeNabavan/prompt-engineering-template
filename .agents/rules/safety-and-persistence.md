# Safety & Data Persistence Guidelines

Guidelines to preserve the integrity of AgentHub's storage layer and mathematical scoring models.

## JSON Data Storage Invariants

1. **Array Shape Invariant**:
   - Files in `backend/data/*.json` (`agents.json`, `categories.json`, `collections.json`, `upvotes.json`) must always be formatted as valid JSON arrays of objects.
   - Never replace an array file with a dictionary mapping.

2. **Immutable Audit Fields**:
   - The primary identifier (`id` UUID) and initial creation timestamp (`created_at`) must remain immutable once written.
   - Any updates must refresh `updated_at` to the current UTC timestamp.

3. **Deduplication Constraints**:
   - Upvotes must be deduplicated by checking both `user_id` and `digital_fingerprint_hash`. Duplicate entries must be rejected.
   - Category slugs and agent slugs must remain unique across the database.

4. **Mathematical Ranking Guarantees**:
   - The exponential time-decay formula:
     $$\text{Score} = \frac{\text{Upvotes}_{7\text{d}} + 1}{(\text{Age}_{\text{hours}} + 2)^{1.5}}$$
     must not be altered without updating the benchmark documentation and test suite assertions.
