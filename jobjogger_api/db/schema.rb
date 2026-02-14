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

ActiveRecord::Schema[8.1].define(version: 2026_02_12_042410) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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
    t.string "priority"
    t.string "salary_range"
    t.string "source"
    t.string "source_other"
    t.string "status", null: false
    t.string "tags", default: [], array: true
    t.datetime "updated_at", null: false
    t.index ["archived_at"], name: "index_jobs_on_archived_at"
    t.index ["company_name"], name: "index_jobs_on_company_name"
    t.index ["follow_up_date"], name: "index_jobs_on_follow_up_date"
    t.index ["job_title"], name: "index_jobs_on_job_title"
    t.index ["status", "follow_up_date"], name: "index_jobs_on_status_and_follow_up_date"
    t.index ["status"], name: "index_jobs_on_status"
    t.index ["tags"], name: "index_jobs_on_tags", using: :gin
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

  add_foreign_key "timeline_entries", "jobs"
end
