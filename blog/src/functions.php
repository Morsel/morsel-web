<?php
//* Start the engine
include_once( get_template_directory() . '/lib/init.php' );

//* Child theme (do not remove)
define( 'CHILD_THEME_NAME', 'ellen' );
define( 'CHILD_THEME_URL', 'http://www.eatmorsel.com/' );
define( 'CHILD_THEME_VERSION', '1.0' );

//* Add HTML5 markup structure
add_theme_support( 'html5' );

//* Add viewport meta tag for mobile browsers
add_theme_support( 'genesis-responsive-viewport' );

//* Add support for custom background
add_theme_support( 'custom-background' );

//* Add support for 3-column footer widgets
add_theme_support( 'genesis-footer-widgets', 3 );

//* Remove the post info function
remove_action( 'genesis_entry_header', 'genesis_post_info', 12 );

//* Customize the post meta function
add_filter( 'genesis_post_meta', 'sp_post_meta_filter' );
function sp_post_meta_filter($post_meta) {
if ( !is_page() ) {
	$post_meta = '[post_date] [post_comments]';
	return $post_meta;
}}

//* Customize the credits 
add_filter('genesis_footer_creds_text', 'footer_creds_filter');
function footer_creds_filter( $creds ) {
    $creds = 'Copyright [footer_copyright]  &middot; <a href="http://eatmorsel.com">Morsel</a>';
    return $creds;
}

//* Greg's Threaded Comment Numbering 
add_action ('genesis_before_comment', 'ellen_numbered_comments');
function ellen_numbered_comments () {
	if (function_exists('gtcn_comment_numbering'))
	echo gtcn_comment_numbering($comment->comment_ID, $args);
}

//* Reposition the primary navigation menu
remove_action( 'genesis_after_header', 'genesis_do_nav' );
add_action( 'genesis_before_header', 'genesis_do_nav' );

//* Register widget areas
genesis_register_sidebar( array(
    'id'            => 'portfolioblurb',
    'name'          => __( 'Portfolio Blurb', 'ellen' ),
    'description'   => __( 'This is a widget area that can be shown above showcase', 'ellen' ),
) );

//* Add new image size
add_image_size( 'widget-featured', 300, 200, TRUE );
add_image_size( 'portfolio-featured', 300, 200, TRUE );
add_image_size( 'blog-featured', 660, 440, TRUE );

//* Change the number of portfolio items to be displayed (props Bill Erickson)
add_action( 'pre_get_posts', 'ellen_portfolio_items' );
function ellen_portfolio_items( $query ) {

	if( $query->is_main_query() && !is_admin() && is_post_type_archive( 'portfolio' ) ) {
		$query->set( 'posts_per_page', '12' );
	}

}

//* Create portfolio custom post type
add_action( 'init', 'portfolio_post_type' );
function portfolio_post_type() {
    register_post_type( 'portfolio',
        array(
            'labels' => array(
                'name' => __( 'Portfolio' ),
                'singular_name' => __( 'Portfolio' ),
            ),
            'exclude_from_search' => true,
            'has_archive' => true,
            'hierarchical' => true,
            'public' => true,
            'rewrite' => array( 'slug' => 'portfolio' ),
            'supports' => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'trackbacks', 'custom-fields', 'comments', 'revisions', 'page-attributes', 'genesis-seo' ),
        )
    );
}

//* Add support for color options
add_theme_support( 'genesis-style-selector', array( 'theme-blue' => 'Blue', 'theme-green' => 'Green', 'theme-orange' => 'Orange', 'theme-pink' => 'Pink', 'theme-red' => 'Red') );

//* Register Widget Area
genesis_register_sidebar( array(
    'id'            => 'slider',
    'name'          => __( 'Slider Widget', 'ellen' ),
    'description'   => __( 'This widget area is for the genesis slider', 'ellen' ),
) );
