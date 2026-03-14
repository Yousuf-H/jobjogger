Rails.application.routes.draw do
  devise_for :users, skip: :all

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Auth routes
      devise_scope :user do
        post 'users/sign_in', to: 'users/sessions#create'
        delete 'users/sign_out', to: 'users/sessions#destroy'
        post 'users', to: 'users/registrations#create'
      end

      # Job routes
      resources :jobs, only: [:create, :index, :show, :update, :destroy] do
        member do
          patch :archive
          patch :unarchive
        end

        resources :timeline_entries, only: [:create]
      end

      resources :timeline_entries, only: [:update, :destroy]
    end
  end
end