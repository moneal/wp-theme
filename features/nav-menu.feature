Feature: Nav Menu
    In order to navigate the site
    As an admin
    I need to create links in the header

    Background:
        Given I have a vanilla wordpress installation
            | name          | email                   | username | password |
            | Tetherow | admin@example.com          | admin    | test     |
        #And I am logged in as "admin" with password "test"
        Given there are plugins
            | plugin    | status  |
            | pods/init.php | enabled |
        And I have "development" theme active
        #And action "after_setup_them" has ran
        And action "init" has ran
        #And taxonomy exists "nav_category"
        And there is a nav menu "Main Menu" in location "primary"
        And there is a nav menu "Top Menu" in location "top"
        And there is a nav menu "Social Menu" in location "social"
        And there is a nav menu "Footer Menu" in location "footer"
        And there are nav menus for "Main Menu"
            | title  | type   | url      | class  | nav_category | sub_items |
            | Home   | custom | /        | home   |              |           |
            | Live   | custom | #example | live   |              |           |
            | Golf   | custom | #link2   | golf   |              |           |
            | Dine   | custom | #dine    | dine   | Dine         |           |
            | Stay   | custom | #link3   | stay   |              | 5         |
            | Events | custom | #link2   | events |              |           |
            | Play   | custom | #link2   | play   |              |           |
        And there are nav menus for "Social Menu"
            | title     | type   | url       | class    |
            | Facebook  | custom | #facebook | facebook |
            | YouTube   | custom | #youtube  | youtube  |
            | Twitter   | custom | #twitter  | twitter  |
        And there are nav menus for "Top Menu"
            | title            | type   | url       | class    |
            | About            | custom | #facebook | facebook |
            | Directions       | custom | #youtube  | youtube  |
            | Blog             | custom | #twitter  | twitter  |
            | Membership       | custom | #twitter  | twitter  |
            | Membership Login | custom | #twitter  | twitter  |
        And there are nav menus for "Footer Menu"
            | title            | type   | url       | class    |
            | About            | custom | #facebook | facebook |
            | Directions       | custom | #youtube  | youtube  |
            | Blog             | custom | #twitter  | twitter  |
            | Membership       | custom | #twitter  | twitter  |
            | Membership Login | custom | #twitter  | twitter  |
        And there are pages
            | post_title            | post_content | post_status | post_author | nav_category | post_type | menu      |
            | Home                  | fake-it      | publish     | 1           | Dine         | page      |           |
            | Our Restaurants       | fake-it      | publish     | 1           | Dine         | page      | Main Menu |
            | Menus                 | fake-it      | publish     | 1           | Dine         | page      | Main Menu |
            | Specials & Promotions | fake-it      | publish     | 1           | Dine         | page      | Main Menu |
            | Born to the Career    | fake-it      | publish     | 1           | Dine         | page      | Main Menu |

    Scenario: View home page
        Given I am on "/"
        Then I should see a link to "#example" in element "#site-navigation"
        Then I should see a link to "#link2" in element "#site-navigation"

