# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Apidoc::Application.initialize!

# Load a yaml file with globals
GLOBAL = YAML.load_file("#{::Rails.root.to_s}/config/global.yml")

