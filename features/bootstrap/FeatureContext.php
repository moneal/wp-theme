<?php
use Behat\Behat\Tester\Exception\PendingException;
use Behat\Behat\Context\Context;
use Behat\Behat\Context\SnippetAcceptingContext;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\MinkExtension\Context\MinkContext;
use Behat\MinkExtension\Context\RawMinkContext;
use PHPUnit_Framework_Assert as PHPUnit;
use Behat\Behat\Definition\Call\Then;

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends RawMinkContext implements Context, SnippetAcceptingContext
{
    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct()
    {
    }

    /**
     * @Given I have :theme theme active
     */
    public function iHaveThemeActive($theme)
    {
        wp_clean_themes_cache();
        switch_theme( $theme );
        if ( file_exists( get_template_directory() . '/functions.php' )) {
            require_once( get_template_directory() . '/functions.php' );
        }
        //print "test";
        //var_dump(wp_get_theme());
        assertEquals($theme, wp_get_theme()->stylesheet);
        //throw new PendingException();
    }

    /**
     * Add these posts to this wordpress installation
     *
     * @see wp_insert_post
     *
     * @Given /^there are pages$/
     */
    public function thereArePages(TableNode $table)
    {
        foreach ($table->getHash() as $postData) {
            $postData['post_type'] = 'page';
            if ( 'fake-it' == $postData['post_content']) {
                $postData['post_content'] = $this->_fake_content();

            }
            if (!is_int( $post_id = wp_insert_post($postData))) {
                throw new \InvalidArgumentException("Invalid post information schema.");
            }
            if ( isset($postData['nav_category'] ) && ! empty($postData['nav_category']) ) {
                $terms = explode(',', $postData['nav_category']);
                foreach ( $terms as $term ) {
                    if ( ! is_int( $term_id = term_exists( $term, 'nav_category' ) ) ) {
                        //$term_id = wp_insert_term( $term, 'nav_category' );
                        //var_dump($term_id);
                    }
                }
                $term_id = wp_set_object_terms( $post_id, $terms, 'nav_category' );
            }
            if ( isset($postData['menu'] ) && ! empty($postData['menu']) ) {
                $menu_object = wp_get_nav_menu_object( $postData['menu'] );
                // need a new empty post
                $menu_data = array(
                    'post_status' => 'publish',
                    'post_type' => 'nav_menu_item',
                );
                $menu_post_id = wp_insert_post( $menu_data );
                wp_set_post_terms( $menu_post_id, $postData['menu'], 'nav_menu', true );
                add_post_meta( $menu_post_id, '_menu_item_menu_item_parent', 7, true);
                add_post_meta( $menu_post_id, '_menu_item_type', 'post_type', true);
                add_post_meta( $menu_post_id, '_menu_item_object', 'page', true);
                add_post_meta( $menu_post_id, '_menu_item_object_id', $post_id, true);
                //add_post_meta( $sub_post_id, '_menu_item_url', '#post-' . $sub_post_id, true);

            }
        }
    }


    /**
     * @Then is front page
     */
    public function isFrontPage()
    {
        assertTrue(is_front_page());
    }
    /**
     * @Then is home page
     */
    public function isHomePage()
    {
        $currentPage = $this->getSession()->getPage();
        var_dump($currentPage);
        assertTrue(is_home());
    }

    /**
     * @Given page :slug is front page
     */
    public function pageIsFrontPage($slug)
    {
        $args = array(
            'name'           => $slug,
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => 1
        );
        $post = get_posts( $args );
        //var_dump($post);
        update_option('page_on_front', $post[0]->ID);
        update_option('show_on_front', 'page');
    }


    /**
     * @Given there are nav menus for :menu
     */
    public function thereAreNavMenusFor( $menu, TableNode $table)
    {
        $menu_object = wp_get_nav_menu_object( $menu );
        PHPUnit::assertNotFalse($menu_object, 'Menu does not exist');
        $menu_order = 1;
        foreach ($table->getHash() as $postData) {
            //var_dump($postData);
            $postData['post_title'] = $postData['title'];
            $postData['post_type'] = 'nav_menu_item';
            $postData['menu_order'] = $menu_order;
            $postData['post_status'] = 'publish';
            if (! is_int( $post_id = wp_insert_post( $postData ) ) ) {
                throw new \InvalidArgumentException("Invalid post information schema.");
            }
            wp_set_post_terms( $post_id, $menu, 'nav_menu', true );
            if ( isset($postData['url']) && empty($postData['nav_category']) ) {
                add_post_meta( $post_id, '_menu_item_url', $postData['url'], true);
            }
            if ( isset($postData['class']) ) {
                $classes = explode(',', $postData['class']);
                add_post_meta( $post_id, '_menu_item_classes', $classes, true);
            }
            if ( isset($postData['nav_category']) && ! empty($postData['nav_category']) ) {
                if ( ! is_int( $term_id = term_exists( $postData['nav_category'], 'nav_category' ) ) ) {
                    $term_id = wp_insert_term( $postData['nav_category'], 'nav_category' );
                }
                add_post_meta( $post_id, '_menu_item_type', 'taxonomy', true);
                add_post_meta( $post_id, '_menu_item_object', 'nav_category', true);
                add_post_meta( $post_id, '_menu_item_object_id', $term_id['term_id'], true);

            }
            // Create a fake sub menu
            if ( isset($postData['sub_items']) && ! empty($postData['sub_items']) ) {
                $faker = Faker\Factory::create();
                for ( $i = 1; $i <= $postData['sub_items']; $i++) {
                    $menu_data = array(
                        'post_title' => $faker->sentence( $faker->numberBetween(1,6) ),
                        //'post_parent' => $post_id,
                        'post_type' => 'nav_menu_item',
                        'post_status'   => 'publish',
                    );
                    if (! is_int( $sub_post_id = wp_insert_post( $menu_data ) ) ) {
                        throw new \InvalidArgumentException("Invalid post information schema.");
                    }
                    wp_set_post_terms( $sub_post_id, $menu, 'nav_menu', true );
                    add_post_meta( $sub_post_id, '_menu_item_menu_item_parent', $post_id, true);
                    add_post_meta( $sub_post_id, '_menu_item_type', 'custom', true);
                    add_post_meta( $sub_post_id, '_menu_item_object', 'custom', true);
                    add_post_meta( $sub_post_id, '_menu_item_url', '#post-' . $sub_post_id, true);
                    $menu_order++;
                }

            } else {
                $menu_order++;
            }
        }
    }

    /**
     * @Given action :action has ran
     */
    public function actionHasRan($action)
    {
        do_action($action);
    }

    /**
     * @Given there is a nav menu :name in location :location
     */
    public function thereIsANavMenu( $name, $location )
    {
        $term = wp_insert_term( $name, 'nav_menu');
        //a:1:{s:18:"nav_menu_locations";a:1:{s:7:"primary";i:2;}}
        //var_dump( $term );
        $theme_mods = get_theme_mod('nav_menu_locations');
        if ( ! $theme_mods ) {
            $theme_mods = array();
        }
        if ( empty($theme_mods) ) {
        }
        $theme_mods[$location] = $term['term_id'];
        set_theme_mod('nav_menu_locations', $theme_mods);
    }

    /**
     * @Then I should see a link to :url in element :element
     */
    public function iShouldSeeALinkToInElement($url, $element)
    {
        $this->assertSession()->elementExists( 'css', sprintf('%s a[href="%s"]', $element, $url) );
    }
    /**
     * @Given taxonomy exists :taxonomy
     */
    public function taxonomyExists($taxonomy)
    {
        //global $wp_taxonomies;
        //var_dump( $wp_taxonomies );
        //var_dump( did_action('init') );
        //global $wp_filter;
        //print_r($wp_filter['init']);
        //die();
        assertTrue( taxonomy_exists( $taxonomy ) );
    }

    public function _fake_content() {
        $faker = Faker\Factory::create();
        $content = implode( "\n\n", $faker->paragraphs( $faker->numberBetween(1,5) ) );
        $content .= sprintf('<h3>%s</h3>', $faker->sentence( $faker->numberBetween(2,6) ) );
        $content .= implode( "\n\n", $faker->paragraphs( $faker->numberBetween(1,5) ) );

        // Link list
        $content .= '<ul class="list-inline">
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
            <li><a href="#">Link 3</a></li>
            <li><a href="#">Link 4</a></li>
        </ul>';

        return $content;
    }
}
