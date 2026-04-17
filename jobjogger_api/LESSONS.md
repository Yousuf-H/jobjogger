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
