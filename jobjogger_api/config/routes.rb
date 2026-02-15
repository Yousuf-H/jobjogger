Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
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
