<?php
/**
 * Polylang Block
 *
 * @package CocoPolylangBlocky
 */

// Prevent direct access to this file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Polylang_Block
 */
class Polylang_Block {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'register_block' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_assets' ] );
		add_action( 'wp_ajax_get_polylang_languages', [ $this, 'ajax_get_languages' ] );
		add_action( 'wp_ajax_nopriv_get_polylang_languages', [ $this, 'ajax_get_languages' ] );
	}

	/**
	 * AJAX endpoint to get Polylang languages
	 */
	public function ajax_get_languages() {
		if ( ! function_exists( 'pll_languages_list' ) ) {
			wp_send_json_error( 'Polylang is not active.' );
			return;
		}

		$languages          = [];
		$polylang_languages = pll_languages_list( [ 'fields' => [] ] );

		foreach ( $polylang_languages as $lang_obj ) {
			$languages[] = [
				'slug' => $lang_obj->slug,
				'name' => $lang_obj->name,
			];
		}

		wp_send_json_success( $languages );
	}

	/**
	 * Register the blocks
	 */
	public function register_block() {
		// Register the language content block
		register_block_type(
			COCO_MP_PLUGIN_DIR . 'src/language-content',
			[
				'render_callback' => [ $this, 'render_block_language_content' ],
			]
		);

		// Register the language switcher block
		register_block_type(
			COCO_MP_PLUGIN_DIR . 'src/language-switcher',
			[
				'render_callback' => [ $this, 'render_language_switcher_block' ],
			]
		);
	}

	/**
	 * Render the language content block
	 *
	 * @param array  $attributes The block attributes.
	 * @param string $content The block content.
	 * @param WP_Block $block The block instance.
	 * @return string The block HTML.
	 */
	public function render_block_language_content( $attributes, $content, $block ) {
		ob_start();
		$block_instance = $block; // Make $block available in render.php
		require COCO_MP_PLUGIN_DIR . 'src/language-content/render.php';
		return ob_get_clean();
	}

	/**
	 * Render the language switcher block
	 *
	 * @param array  $attributes The block attributes.
	 * @param string $content The block content.
	 * @param WP_Block $block The block instance.
	 * @return string The block HTML.
	 */
	public function render_language_switcher_block( $attributes, $content, $block ) {

		return require COCO_MP_PLUGIN_DIR . 'src/language-switcher/render.php';

	}

	/**
	 * Enqueue editor assets
	 */
	public function enqueue_editor_assets() {
		if ( function_exists( 'pll_languages_list' ) ) {
			$languages          = [];
			$polylang_languages = pll_languages_list( [ 'fields' => [] ] );

			foreach ( $polylang_languages as $lang_obj ) {
				$languages[] = [
					'slug' => $lang_obj->slug,
					'name' => $lang_obj->name,
				];
			}

			wp_localize_script(
				'coco-polylang-blocky-polylang-language-content-editor',
				'polylangLanguages',
				$languages
			);
		}

		wp_set_script_translations(
			'coco-polylang-blocky-polylang-language-content-editor',
			'coco-polylang-blocky',
			COCO_MP_PLUGIN_DIR . 'languages'
		);
	}
}
