class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :authenticate
  
  protected
    def authenticate
      authenticate_or_request_with_http_basic do |username, password|
        username == "smetrics" && password == "apihelp"
      end
    end
end
