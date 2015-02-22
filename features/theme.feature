Feature: Theme
    In order to manage plugins
    As an admin
    I need to enable and disable plugins

    Background:
        Given I have a vanilla wordpress installation
            | name          | email                   | username | password |
            | Tetherow | admin@example.com          | admin    | test     |
        #And I am logged in as "admin" with password "test"
        And I have "tetherow" theme active
        And there are pages
            | post_title      | post_content              | post_status | post_author |
            | Home            | The content of my article | publish     | 1           |
            | My draft        | This is just a draft      | draft       | 1           |
        And page "home" is front page

    Scenario: View home page
        Given I am on "/"
        Then I should see "Home"
        #And is home page

    #Scenario: Enable the dolly plugin
    #    #Given some crazy action here
    #    Given there are plugins
    #        | plugin    | status  |
    #        | hello.php | enabled |
    #    When I go to "/wp-admin/"
    #    Then I should see a "#dolly" element
#
#    Scenario: Disable the dolly plugin
#        Given there are plugins
#            | plugin    | status   |
#            | hello.php | disabled |
#        When I go to "/wp-admin/"
#        Then I should not see a "#dolly" element
