# frozen_string_literal: true

class CreateOauthExchanges < ActiveRecord::Migration[7.2]
  def change
    create_table :oauth_exchanges do |t|
      t.string     :jti,        null: false
      t.references :user,       null: false, foreign_key: true
      t.string     :session_id, null: false
      t.datetime   :expires_at, null: false
      t.datetime   :consumed_at

      t.timestamps
    end

    add_index :oauth_exchanges, :jti, unique: true
    add_index :oauth_exchanges, :expires_at
  end
end
