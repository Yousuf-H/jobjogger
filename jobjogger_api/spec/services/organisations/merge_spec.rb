# frozen_string_literal: true

require "rails_helper"

RSpec.describe Organisations::Merge do
  let(:user) { create(:user) }
  let!(:target)    { create(:organisation, user: user, name: "Acme Corp", notes: nil, rating: nil) }
  let!(:duplicate) { create(:organisation, user: user, name: "Acme", notes: "Good company", rating: 4) }

  subject(:call) { described_class.new(duplicate: duplicate, target: target).call }

  describe "#call" do
    context "when duplicate and target are different records" do
      it "returns true" do
        expect(call).to be true
      end

      it "destroys the duplicate" do
        call
        expect(Organisation.exists?(duplicate.id)).to be false
      end

      it "keeps the target" do
        call
        expect(Organisation.exists?(target.id)).to be true
      end

      it "absorbs the duplicate name into target aliases" do
        call
        expect(target.reload.aliases).to include("Acme")
      end

      it "does not include the target's own name in its aliases" do
        call
        aliases = target.reload.aliases.map(&:downcase)
        expect(aliases).not_to include("acme corp")
      end
    end

    context "when duplicate and target are the same record" do
      subject(:call) { described_class.new(duplicate: target, target: target).call }

      it "returns false without making any changes" do
        expect(call).to be false
        expect(Organisation.count).to eq(2)
      end
    end

    context "relinking associated records" do
      let!(:job)              { create(:job, user: user, organisation: duplicate) }
      let!(:contact)          { create(:contact, user: user) }
      let!(:interview_question) { create(:interview_question, user: user, organisation: duplicate) }

      before do
        contact.update!(organisation: duplicate)
      end

      it "relinks jobs from duplicate to target" do
        call
        expect(job.reload.organisation_id).to eq(target.id)
      end

      it "relinks contacts from duplicate to target" do
        call
        expect(contact.reload.organisation_id).to eq(target.id)
      end

      it "relinks interview questions from duplicate to target" do
        call
        expect(interview_question.reload.organisation_id).to eq(target.id)
      end
    end

    context "field preservation — blank fields on target are filled from duplicate" do
      it "copies notes from duplicate when target has none" do
        call
        expect(target.reload.notes).to eq("Good company")
      end

      it "copies rating from duplicate when target has none" do
        call
        expect(target.reload.rating).to eq(4)
      end
    end

    context "field preservation — non-blank fields on target are not overwritten" do
      let!(:target) do
        create(:organisation, user: user, name: "Acme Corp", notes: "Primary record", rating: 5)
      end

      it "does not overwrite target notes with duplicate's value" do
        call
        expect(target.reload.notes).to eq("Primary record")
      end

      it "does not overwrite target rating with duplicate's value" do
        call
        expect(target.reload.rating).to eq(5)
      end
    end

    context "alias merging" do
      let!(:target) do
        create(:organisation, user: user, name: "Acme Corp", aliases: ["Acme Corp Ltd"])
      end
      let!(:duplicate) do
        create(:organisation, user: user, name: "Acme", aliases: ["ACM", "Acme Corp Ltd"])
      end

      it "merges aliases from both records without duplicates" do
        call
        aliases = target.reload.aliases
        expect(aliases).to include("Acme", "ACM", "Acme Corp Ltd")
        expect(aliases.length).to eq(aliases.uniq.length)
      end
    end

    context "atomicity" do
      before do
        allow(duplicate).to receive(:destroy!).and_raise(ActiveRecord::RecordNotDestroyed)
      end

      it "rolls back all changes when an error occurs mid-transaction" do
        expect { call }.to raise_error(ActiveRecord::RecordNotDestroyed)
        expect(Organisation.exists?(duplicate.id)).to be true
        expect(target.reload.aliases).not_to include("Acme")
      end
    end
  end
end
