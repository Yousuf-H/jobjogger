# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_21_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "contact_interactions", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.datetime "created_at", null: false
    t.string "interaction_type", null: false
    t.text "notes"
    t.datetime "occurred_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id"], name: "index_contact_interactions_on_contact_id"
    t.index ["occurred_at"], name: "index_contact_interactions_on_occurred_at"
  end

  create_table "contact_jobs", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id", "job_id"], name: "index_contact_jobs_on_contact_id_and_job_id", unique: true
    t.index ["contact_id"], name: "index_contact_jobs_on_contact_id"
    t.index ["job_id"], name: "index_contact_jobs_on_job_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.string "linkedin_url"
    t.string "name", null: false
    t.text "notes"
    t.bigint "organisation_id"
    t.string "phone"
    t.string "role"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["organisation_id"], name: "index_contacts_on_organisation_id"
    t.index ["user_id", "name"], name: "index_contacts_on_user_id_and_name"
    t.index ["user_id"], name: "index_contacts_on_user_id"
  end

  create_table "interview_questions", force: :cascade do |t|
    t.text "answer"
    t.string "category", null: false
    t.datetime "created_at", null: false
    t.boolean "is_favourite", default: false, null: false
    t.bigint "job_id"
    t.bigint "organisation_id"
    t.text "question", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["job_id"], name: "index_interview_questions_on_job_id"
    t.index ["organisation_id"], name: "index_interview_questions_on_organisation_id"
    t.index ["user_id", "category"], name: "index_interview_questions_on_user_id_and_category"
    t.index ["user_id"], name: "index_interview_questions_on_user_id"
  end

  create_table "interviews", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "debrief_notes"
    t.string "format"
    t.string "interview_type", null: false
    t.bigint "job_id", null: false
    t.string "location_or_link"
    t.string "outcome", default: "pending", null: false
    t.text "prep_notes"
    t.datetime "scheduled_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id", "scheduled_at"], name: "index_interviews_on_job_id_and_scheduled_at"
    t.index ["job_id"], name: "index_interviews_on_job_id"
  end

  create_table "job_interview_questions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "interview_question_id", null: false
    t.bigint "job_id", null: false
    t.datetime "updated_at", null: false
    t.index ["interview_question_id"], name: "index_job_interview_questions_on_interview_question_id"
    t.index ["job_id", "interview_question_id"], name: "index_job_interview_questions_on_job_and_question", unique: true
    t.index ["job_id"], name: "index_job_interview_questions_on_job_id"
  end

  create_table "jobs", force: :cascade do |t|
    t.datetime "archived_at"
    t.string "company_name", null: false
    t.datetime "created_at", null: false
    t.date "date_applied"
    t.string "employment_type"
    t.date "follow_up_date"
    t.text "job_description"
    t.string "job_title", null: false
    t.text "job_url"
    t.string "location"
    t.string "next_action"
    t.text "notes"
    t.bigint "organisation_id"
    t.string "priority"
    t.string "salary_range"
    t.string "source"
    t.string "source_other"
    t.string "status", null: false
    t.string "tags", default: [], array: true
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["archived_at"], name: "index_jobs_on_archived_at"
    t.index ["company_name"], name: "index_jobs_on_company_name"
    t.index ["follow_up_date"], name: "index_jobs_on_follow_up_date"
    t.index ["job_title"], name: "index_jobs_on_job_title"
    t.index ["organisation_id"], name: "index_jobs_on_organisation_id"
    t.index ["status", "follow_up_date"], name: "index_jobs_on_status_and_follow_up_date"
    t.index ["status"], name: "index_jobs_on_status"
    t.index ["tags"], name: "index_jobs_on_tags", using: :gin
    t.index ["user_id", "job_url"], name: "index_jobs_on_user_id_and_job_url", unique: true, where: "(job_url IS NOT NULL)"
    t.index ["user_id"], name: "index_jobs_on_user_id"
  end

  create_table "organisations", force: :cascade do |t|
    t.string "aliases", default: [], array: true
    t.datetime "created_at", null: false
    t.string "industry"
    t.string "name", null: false
    t.boolean "needs_review", default: true, null: false
    t.text "notes"
    t.decimal "rating", precision: 3, scale: 1
    t.string "size"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "website"
    t.index "user_id, lower((name)::text)", name: "index_organisations_on_user_id_and_lower_name", unique: true
    t.index ["user_id"], name: "index_organisations_on_user_id"
  end

  create_table "timeline_entries", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.string "entry_type", null: false
    t.bigint "job_id", null: false
    t.jsonb "metadata"
    t.datetime "occurred_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "updated_at", null: false
    t.index ["job_id", "occurred_at"], name: "index_timeline_entries_on_job_id_and_occurred_at", order: { occurred_at: :desc }
    t.index ["job_id"], name: "index_timeline_entries_on_job_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "demo", default: false, null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "google_uid"
    t.string "name", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "terms_agreed_at"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["google_uid"], name: "index_users_on_google_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "contact_interactions", "contacts"
  add_foreign_key "contact_jobs", "contacts"
  add_foreign_key "contact_jobs", "jobs"
  add_foreign_key "contacts", "organisations", on_delete: :nullify
  add_foreign_key "contacts", "users"
  add_foreign_key "interview_questions", "jobs"
  add_foreign_key "interview_questions", "organisations"
  add_foreign_key "interview_questions", "users"
  add_foreign_key "interviews", "jobs"
  add_foreign_key "job_interview_questions", "interview_questions"
  add_foreign_key "job_interview_questions", "jobs"
  add_foreign_key "jobs", "organisations"
  add_foreign_key "jobs", "users"
  add_foreign_key "organisations", "users"
  add_foreign_key "timeline_entries", "jobs"
end
