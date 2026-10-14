Rails.application.routes.draw do
  resources :articles do    # /articles, /articles/1
    resources :comments     # /articles/1/comments, /comments/1
  end

  root to: "articles#index" # /
end
