<?php
/**
 * Render the Polylang Language Switcher block
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block_instance Block instance.
 *
 * @package CocoPolylangBlocky
 */

// Check if Polylang is active.
if ( ! function_exists( 'pll_the_languages' ) ) {
	return '<div class="wp-block-coco-polylang-blocky-language-switcher"><p>' . esc_html__( 'Polylang plugin is not active.', 'coco-polylang-blocky' ) . '</p></div>';
}

$wrapper_attributes = get_block_wrapper_attributes();
$layout             = $attributes['layout'] ?? 'list';
$hide_current       = $attributes['hide_current'] ?? false;
$show_flags         = $attributes['show_flags'] ?? false;
$current_language   = function_exists( 'pll_current_language' ) ? pll_current_language() : '';

// Get all available languages
$languages = [];
if ( function_exists( 'pll_languages_list' ) ) {
	$polylang_languages = pll_languages_list( [ 'fields' => [] ] );
	$current_post_id    = get_the_ID();

	foreach ( $polylang_languages as $lang_obj ) {
		$url = '';
		// Fallback to home url if there is no current post id.
		if ( ! $current_post_id ) {
			$url = pll_home_url( $lang_obj->slug );
		} else {
			$translated_post_id = pll_get_post( $current_post_id, $lang_obj->slug );
			if ( $translated_post_id ) {
				$url = get_permalink( $translated_post_id );
			} else {
				$url = pll_home_url( $lang_obj->slug );
			}
		}

		$languages[] = [
			'slug'    => $lang_obj->slug,
			'name'    => $lang_obj->name,
			'url'     => $url,
			'flag'    => $lang_obj->flag_url,
			'current' => $lang_obj->slug === $current_language,
		];
	}
}

// If no languages found, show a message
if ( empty( $languages ) ) {
	return '<div ' . $wrapper_attributes . '><p>' . esc_html__( 'No languages found in Polylang.', 'coco-polylang-blocky' ) . '</p></div>';
}

// Start building the output
$output = '<div ' . $wrapper_attributes . '>';

// Add layout-specific class
$output .= '<div class="polylang-language-switcher layout-' . esc_attr( $layout ) . '">';

// Create the language list
$output .= '<ul class="language-list">';

// Add current language as the first item for dropdown layout
if ( $layout === 'dropdown' ) {
	$current_lang = array_filter( $languages, function( $lang ) {
		return $lang['current'];
	});

	$current_lang = reset( $current_lang );

	if ( $current_lang ) {
		$flag_url   = plugin_dir_url( dirname( __DIR__ ) ) . 'assets/flags/' . $current_lang['slug'] . '.svg';
		$flag_img   = $show_flags ? '<img src="' . esc_url( $flag_url ) . '" alt="' . esc_attr( $current_lang['name'] ) . '" class="polylang-flag" />' : '';

		$output .= '<li class="current-language">';
		$output .= $flag_img;
		$output .= '<span class="language-info"><span class="language-name">' . esc_html( $current_lang['name'] ) . '</span>';
		$output .= '<span class="dropdown-arrow">&#9662;</span></span>'; // Down arrow
		$output .= '<ul class="dropdown-languages">';
	}
}

// Add all languages
foreach ( $languages as $lang ) {

	// Skip current language if 'hide_current' is enabled
	if ( $hide_current && $lang['current'] ) {
		continue;
	}

	// For dropdown layout, skip the current language in the dropdown list itself (it's already at the top)
	if ( $layout === 'dropdown' && $lang['current'] ) {
		continue;
	}

	$item_class = $lang['current'] ? 'language-item current' : 'language-item';
	$flag_url   = plugin_dir_url( dirname( __DIR__ ) ) . 'assets/flags/' . $lang['slug'] . '.svg';
	$flag_img   = $show_flags ? '<img src="' . esc_url( $flag_url ) . '" alt="' . esc_attr( $lang['name'] ) . '" class="polylang-flag" />' : '';

	// For dropdown layout, all items go inside the dropdown
	if ( $layout === 'dropdown' ) {
		$output .= '<li class="' . esc_attr( $item_class ) . '">';
		$output .= '<a href="' . esc_url( $lang['url'] ) . '" lang="' . esc_attr( $lang['slug'] ) . '">';
		$output .= $flag_img;
		$output .= '<span class="language-name">' . esc_html( $lang['name'] ) . '</span>';
		$output .= '</a>';
		$output .= '</li>';
	} else {
		// For list layout, all items are at the same level
		$output .= '<li class="' . esc_attr( $item_class ) . '">';

		if ( $lang['current'] ) {
			$output .= $flag_img;
			$output .= '<span class="language-name">' . esc_html( $lang['name'] ) . '</span>';
		} else {
			$output .= '<a href="' . esc_url( $lang['url'] ) . '" lang="' . esc_attr( $lang['slug'] ) . '">';
			$output .= $flag_img;
			$output .= '<span class="language-name">' . esc_html( $lang['name'] ) . '</span>';
			$output .= '</a>';
		}

		$output .= '</li>';
	}
}

// Close the dropdown submenu if needed
if ( $layout === 'dropdown' ) {
	$output .= '</ul></li>';
}

$output .= '</ul>';
$output .= '</div>';
$output .= '</div>';

return $output;