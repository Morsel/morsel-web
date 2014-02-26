<?php

add_action( 'genesis_meta', 'ellen_home_genesis_meta' );
/**
 * Add widget support for homepage.
 *
 */
function ellen_home_genesis_meta() {

	if ( is_active_sidebar( 'slider' )) {
	
		add_action( 'genesis_before_loop', 'ellen_home_loop_helper' );

	}
}

/**
 * Display widget content for home slider section
 *
 */
function ellen_home_loop_helper() {

	if ( is_active_sidebar( 'slider' )) {

		echo '<div id="slider">';
		echo '<div class="slider">';
		dynamic_sidebar( 'slider' );
		echo '</div><!-- end .slider -->';
	        echo '</div><!-- end #slider -->';

	}

}

genesis();