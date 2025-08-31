<?php
/**
 * Plugin Name: Coco Polylang Blocky
 * Plugin URI: https://cobianzo.com/plugins/coco-polylang-blocky/
 * Description: Extends the free Polylang plugin to insert content in the block editor adapted to each selected language. This plugin also adds the language_switcher block for Polylang.
 * Version: 1.0.2
 * Author: cobianzo
 * Author URI: https://cobianzo.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: coco-polylang-blocky
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.1
 *
 * @package CocoPolylangBlocky
 */

// Prevent direct access to this file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define plugin constants
 */
define( 'COCO_MP_VERSION', '1.0.0' );
define( 'COCO_MP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'COCO_MP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Initialize plugin
 *
 * @return void
 */
function coco_mp_init(): void {

	// Check if Polylang is active and theme supports Gutenberg.
	add_action( 'admin_init', 'coco_polylang_blocky_check_dependencies' );

	// includes
	require_once COCO_MP_PLUGIN_DIR . 'inc/class-admin-enqueue.php';
	require_once COCO_MP_PLUGIN_DIR . 'inc/class-polylang-block.php';
}

/**
 * Check if Polylang is active and theme supports Gutenberg.
 *
 * @return void
 */
add_action( 'plugins_loaded', 'coco_polylang_blocky_check_dependencies' );

function coco_polylang_blocky_check_dependencies(): void {
	// Check if Polylang is active.
	if ( ! is_plugin_active( 'polylang/polylang.php' ) ) {
		add_action(
			'admin_notices',
			function () {
				?>
				<div class="notice notice-error is-dismissible">
					<p>
						<?php
						echo esc_html__( 'Coco Polylang Blocky requires Polylang to be installed and active.', 'coco-polylang-blocky' );
						?>
					</p>
				</div>
				<?php
			}
		);
		return;
	}

	// Check if the theme supports Gutenberg blocks
	if ( ! function_exists( 'use_block_editor_for_post_type' ) || ! use_block_editor_for_post_type( 'post' ) ) {
		add_action(
			'admin_notices',
			function () {
				?>
				<div class="notice notice-error is-dismissible">
					<p>
						<?php
						echo esc_html__( 'Coco Polylang Blocky requires a theme that supports Gutenberg blocks.', 'coco-polylang-blocky' );
						?>
					</p>
				</div>
				<?php
			}
		);
		return;
	}
}


// Initialize the plugin
coco_mp_init();

new Polylang_Block();

// Debugging functions.
// phpcs:disable
if ( ! function_exists( 'dd' ) ) {
	/**
	 * Debug function to dump variables
	 *
	 * @param mixed $var Variable to dump
	 * @return void
	 */
	function dd( mixed $var ): void {
		echo '<pre>';
		var_dump( $var );
		echo '</pre>';
	}
}

if ( ! function_exists( 'ddie' ) ) {
	/**
	 * Debug function to dump variables and die
	 *
	 * @param mixed $var Variable to dump
	 * @return never
	 */
	function ddie( mixed $var = '' ): never {
		dd( $var );
		wp_die();
	}
}
// phpcs:enable
