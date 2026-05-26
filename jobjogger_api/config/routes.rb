Rails.application.routes.draw do
  devise_for :users, skip: :all

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Google OAuth callback (OmniAuth middleware handles /auth/google_oauth2 initiation)
  get "/auth/google_oauth2/callback", to: "omniauth_callbacks#google_oauth2"

  namespace :api do
    namespace :v1 do
      # OAuth session exchange (converts short-lived exchange token to JWT cookie)
      post "auth/session", to: "auth/callback#create"

      # Demo login
      post "demo/session", to: "demo/sessions#create"

      # Extension
      get 'users/me', to: 'users/me#show'
      patch 'users/me/accept_terms', to: 'users/me#accept_terms'

      # Auth routes
      devise_scope :user do
        post 'users/sign_in', to: 'users/sessions#create'
        delete 'users/sign_out', to: 'users/sessions#destroy'
        post 'users', to: 'users/registrations#create'
        patch 'users', to: 'users/registrations#update'
        delete 'users', to: 'users/registrations#destroy'
        patch 'users/password', to: 'users/registrations#update_password'
        patch 'users/password/set', to: 'users/registrations#set_initial_password'
        patch 'users/avatar', to: 'users/registrations#update_avatar'
        delete 'users/avatar', to: 'users/registrations#delete_avatar'
        delete 'users/google', to: 'users/registrations#unlink_google'
      end

      # Analytics
      resources :analytics, only: [:index]


      # Organisations
      resources :organisations, only: [:index, :show, :create, :update, :destroy] do
        member do
          patch :merge
          patch :dismiss_review
          get :similar
        end
      end

      # Contacts
      resources :contacts, only: [:index, :show, :create, :update, :destroy] do
        resources :contact_interactions, only: [:create, :destroy]
      end

      # Job routes
      resources :jobs, only: [:create, :index, :show, :update, :destroy] do
        member do
          patch :archive
          patch :unarchive
        end

        # Timeline entries (nested under jobs for creation)
        resources :timeline_entries, only: [:create]

        # Contacts linked to a specific job
        resources :job_contacts, only: [:index, :create, :destroy]

        # Interviews
        resources :interviews, only: [:index, :create, :update, :destroy]

        # Questions pinned to this job via the join table
        resources :job_interview_questions, only: [:index, :create, :destroy]
      end

      # Interview questions (scoped by query params: personal / job / org)
      resources :interview_questions, only: [:index, :create, :update, :destroy]

      # Timeline entries (top-level for update/destroy)
      resources :timeline_entries, only: [:update, :destroy]

      # Resume library
      resources :resume_templates do
        resources :resume_variants, only: [:index, :create]
      end
      resources :resume_variants, only: [:show, :update, :destroy]
    end
  end

  # Catch-all for unknown routes — silences bot probe noise
  match '*unmatched', to: 'application#not_found', via: :all
end