# Recurring Issues — API

A living list of mistakes that have appeared in review more than once.
Check this before opening a PR that touches controllers or models.

---

## 1. Enforce resource ownership on every write action

**The pattern:** `update` and `destroy` actions that accept a foreign key (e.g. `organisation_id`,
`job_id`) from params without verifying the referenced record belongs to `current_user`.

**Why it matters:** A user can pass any ID and silently attach their data to another user's
record, leak cross-tenant data via the response, or trigger unhandled foreign-key DB errors.

**The rule:** Any time a controller accepts a foreign-key param, scope the lookup to
`current_user` before using it.

```ruby
# Bad
@contact.update(contact_params)  # organisation_id comes straight from params

# Good
organisation = current_user.organisations.find_by(id: params[:organisation_id])
return render json: { error: "Not found" }, status: :not_found unless organisation
@contact.update(contact_params.merge(organisation: organisation))
```

**Seen in:** contacts (PR #36), organisations, jobs.

---

## 2. Scope every index/show/update/destroy to current_user

**The pattern:** Querying a model directly (`Contact.find(params[:id])`) instead of scoping
through the authenticated user (`current_user.contacts.find(...)`).

**Why it matters:** Any authenticated user can read or mutate any other user's records.

**The rule:** Always start queries from `current_user.resource_name` — never from the model
class directly.

```ruby
# Bad
@contact = Contact.find(params[:id])

# Good
@contact = current_user.contacts.find(params[:id])
```

---

## 3. Use find_or_create_by! (not find_or_create_by) for join records

**The pattern:** Using `find_or_create_by` without the bang on join tables.

**Why it matters:** The non-bang version silently swallows DB errors (e.g. uniqueness
constraint violations) and returns a record with errors instead of raising.

**The rule:** Use `find_or_create_by!` and rescue `ActiveRecord::RecordInvalid` explicitly
if you need to handle the failure path.

---

## 4. Rescue ArgumentError in every action that accepts an enum param

**The pattern:** Adding `rescue ArgumentError` to `update` but not to `create`.

**Why it matters:** Rails raises `ArgumentError` at `.build()` / `.assign_attributes()` time
when an unrecognised enum value is passed — before `.save` is called. Without a rescue in
`create`, a bad client payload (stale value, typo, different API version) returns a 500
instead of a 422.

**The rule:** Any action that calls `.build(params)` or `.update(params)` with a permitted
enum field needs `rescue ArgumentError => e` wrapping the whole action — not just the save.

```ruby
# Bad — create has no rescue, update does
def create
  interview = @job.interviews.build(interview_params)
  if interview.save
    render json: interview, status: :created
  else
    render json: { errors: interview.errors.full_messages }, status: :unprocessable_content
  end
end

# Good — both actions rescue the same way
def create
  interview = @job.interviews.build(interview_params)
  if interview.save
    render json: interview, status: :created
  else
    render json: { errors: interview.errors.full_messages }, status: :unprocessable_content
  end
rescue ArgumentError => e
  render json: { errors: [ e.message ] }, status: :unprocessable_content
end
```

**Seen in:** interviews controller (feature/interview PR #38).

---

## 5. Use .key?() not .present?() when a FK param can be explicitly cleared

**The pattern:** A `scope_params` / merge helper that only sets a foreign key when the
param value is present, intending to also handle the case where a user clears the association.

**Why it matters:** `nil.present?` is `false`, so sending `job_id: null` from the client
looks identical to omitting `job_id` entirely. The stale FK stays on the record — the
question (or contact, etc.) remains tied to the previous job/org after the update.

**The rule:** Use `.key?(:field)` to detect whether the client explicitly sent the param
(even as nil). Only then decide whether to set or clear the value. Omitting the key
entirely means "don't touch it" (correct PATCH semantics).

```ruby
# Bad — nil sent by client is silently ignored; stale FK survives the update
if (job_id = params.dig(:interview_question, :job_id)).present?
  resolved[:job_id] = current_user.jobs.find(job_id).id
end

# Good — key present but nil → clear; key present with value → verify & set; key absent → skip
if question_params_raw.key?(:job_id)
  job_id = question_params_raw[:job_id]
  resolved[:job_id] = job_id.present? ? current_user.jobs.find(job_id).id : nil
end
```

**Seen in:** interview_questions controller scope_params (feature/interview PR #38).

---

## 6. `where.not` on a nullable column does not match NULL rows

**The pattern:** Writing a guard like `where.not(jobs: { organisation_id: value })` to find
records that don't belong to a given organisation.

**Why it matters:** SQL's three-valued logic means `WHERE NOT (col = val)` evaluates to NULL
(not TRUE) for rows where `col IS NULL`. Those rows are silently excluded from the result,
so unassigned records pass through the guard undetected.

**The rule:** When using `where.not` against a nullable column, always add an explicit
`OR col IS NULL` clause to catch unassigned rows.

```ruby
# Bad — rows with organisation_id = NULL are silently ignored
.where.not(jobs: { organisation_id: org_id })

# Good — catches both wrong-org and no-org rows
.where("jobs.organisation_id != ? OR jobs.organisation_id IS NULL", org_id)
```

**Seen in:** interview_questions controller org re-scope guard (feature/interview PR #38).
`jobs.organisation_id` is nullable by design — any SQL comparison against it must
handle NULL explicitly.
