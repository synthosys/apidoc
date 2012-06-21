class PagesController < ApplicationController
  def content
    if params[:resource].nil? then resource = 'introduction' else resource = params[:resource] end
    resource_params = GLOBAL['resources'][resource]
    #set the name param
    @resource = resource
    #set other params
    @content_path = "#{Rails.root.to_s}#{GLOBAL['content_path']}#{resource}" #not DRY, repeating Rails root in the path - figure out how to put this in the yml file itself
    #title
    @title = resource_params['title']
    #subhead
    @subhead = resource_params['subhead']
    #components
    @overview = resource_params['overview']
    @request = resource_params['request']
    @result = resource_params['result']
    @connections = resource_params['connections']
    #examples
    @examples = resource_params['examples']
    #disqus
    @disqus_identifier = "content/#{@resource}"
    @disqus_title = "API | Content | #{@title}"
  end

  def examples
    if params[:resource].nil? then resource = 'introduction' else resource = params[:resource] end
    if params[:example].nil? then @example = 1 else @example = params[:example].to_i end
    resource_params = GLOBAL['resources'][resource]
    #set the name param
    @resource = resource
    @content_path = "#{Rails.root.to_s}#{GLOBAL['content_path']}#{resource}" #not DRY, repeating Rails root in the path - figure out how to put this in the yml file itself
    #title
    @title = resource_params['title']
    #subhead
    @subhead = resource_params['subhead']
    #override
    if resource=='introduction' then
      @title = 'General'
      @subhead = ''
    end
    #examples
    @examples = resource_params['examples']
    #example title
    @example_title = resource_params['examples'][@example-1]
    #disqus
    @disqus_identifier = "examples/#{@resource}/#{@example}"
    @disqus_title = "API | Examples | #{@title} | #{@example_title}"
  end

  def downloads
  end

  def sdk
  end

  def orglist
  end
end
