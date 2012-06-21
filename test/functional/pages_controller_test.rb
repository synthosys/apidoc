require 'test_helper'

class PagesControllerTest < ActionController::TestCase
  test "should get content" do
    get :content
    assert_response :success
  end

  test "should get examples" do
    get :examples
    assert_response :success
  end

  test "should get downloads" do
    get :downloads
    assert_response :success
  end

  test "should get sdk" do
    get :sdk
    assert_response :success
  end

  test "should get orglist" do
    get :orglist
    assert_response :success
  end

end
