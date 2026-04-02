Rails.application.routes.draw do
  devise_for :users, skip: :all

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Demo login
      post "demo/session", to: "demo/sessions#create"

      # Auth routes
      devise_scope :user do
        post 'users/sign_in', to: 'users/sessions#create'
        delete 'users/sign_out', to: 'users/sessions#destroy'
        post 'users', to: 'users/registrations#create'
        patch 'users', to: 'users/registrations#update'
        delete 'users', to: 'users/registrations#destroy'
        patch 'users/password', to: 'users/registrations#update_password'
        patch 'users/avatar', to: 'users/registrations#update_avatar'
        delete 'users/avatar', to: 'users/registrations#delete_avatar'
      end

      # Analytics
      resources :analytics, only: [:index]

      # Job routes
      resources :jobs, only: [:create, :index, :show, :update, :destroy] do
        member do
          patch :archive
          patch :unarchive
        end

        # Timeline entries (nested under jobs for creation)
        resources :timeline_entries, only: [:create]
      end

      # Timeline entries (top-level for update/destroy)
      resources :timeline_entries, only: [:update, :destroy]
    end
  end
end