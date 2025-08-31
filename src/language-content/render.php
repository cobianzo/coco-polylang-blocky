<?php
/**
 * Render the Polylang Language Content block
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block_instance Block instance.
 *
 * @package CocoPolylangBlocky
 */

// Prevent direct access to this file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check if Polylang is active.
if ( ! function_exists( 'pll_current_language' ) ) {
	return '<div class="wp-block-coco-polylang-blocky-polylang-language-content"><p>' . esc_html__( 'Polylang plugin is not active.', 'coco-polylang-blocky' ) . '</p></div>';
}

$current_language   = pll_current_language();
$wrapper_attributes = get_block_wrapper_attributes();

// Ensure current language is set, fallback to default if necessary.
if ( empty( $current_language ) ) {
	$current_language = pll_default_language();
}

$rendered_content = '';
$found_match      = false;

// First, try to find content for the current language.
if ( ! empty( $block_instance->inner_blocks ) ) {
	foreach ( $block_instance->inner_blocks as $inner_block ) {

		// Attempt to get className from various possible locations.
		$block_class_name = '';
		if ( isset( $inner_block->attrs['className'] ) ) {
			$block_class_name = $inner_block->attrs['className'];
		} elseif ( isset( $inner_block->attrs['class'] ) ) {
			$block_class_name = $inner_block->attrs['class'];
		} elseif ( isset( $inner_block->parsed_block['attrs']['className'] ) ) {
			$block_class_name = $inner_block->parsed_block['attrs']['className'];
		} elseif ( isset( $inner_block->parsed_block['attrs']['class'] ) ) {
			$block_class_name = $inner_block->parsed_block['attrs']['class'];
		}

		// Fallback to parsing innerContent if className is still empty.
		if ( empty( $block_class_name ) && isset( $inner_block->innerContent ) && is_array( $inner_block->innerContent ) ) {
			$inner_html = implode( '', $inner_block->innerContent );
			if ( preg_match( '/class="(.*?language-content-[a-z]{2,3}.*?)\'/s', $inner_html, $matches ) ) {
				$block_class_name = $matches[1];
			}
		}

		// Extract language slug from the inner block's class name.
		if ( preg_match( '/language-content-([a-z]{2,3})/', $block_class_name, $matches ) ) {
			$inner_block_language = $matches[1];

			if ( $inner_block_language === $current_language ) {
				$rendered_content = $inner_block->render();
				$found_match      = true;
				break; // Found the content for the current language.
			}
		}
	}
}

// Fallback: If no content found for the current language, try to render the default language content.
if ( ! $found_match && function_exists( 'pll_default_language' ) ) {
	$default_language = pll_default_language();
	if ( ! empty( $default_language ) && $default_language !== $current_language ) {
		foreach ( $block_instance->inner_blocks as $inner_block ) {
			$block_class_name = $inner_block->attrs['className'] ?? '';
			if ( preg_match( '/language-content-([a-z]{2,3})/', $block_class_name, $matches ) ) {
				$inner_block_language = $matches[1];
				if ( $inner_block_language === $default_language ) {
					$rendered_content = $inner_block->render();
					$found_match      = true;
					break; // Found the content for the default language.
				}
			}
		}
	}
}

// Final fallback: If still no content, render the first available inner block.
if ( ! $found_match && ! empty( $block_instance->inner_blocks ) ) {
	$rendered_content = $block_instance->inner_blocks[0]->render();
	$found_match      = true;
}

// If still no content, display a message.
if ( ! $found_match ) {
	$available_languages = function_exists( 'pll_languages_list' ) ? pll_languages_list() : [];
	$language_names      = [];
	foreach ( $available_languages as $lang ) {
		$language_names[] = is_object( $lang ) ? $lang->name : $lang;
	}
	$rendered_content = '<div class="polylang-no-content"><p>' . sprintf(
		esc_html__( 'No content available for the current language (%1$s). Available languages: %2$s', 'coco-polylang-blocky' ),
		$current_language,
		implode( ', ', $language_names )
	) . '</p></div>';
}

printf(
	'<div %1$s>%2$s</div>',
	$wrapper_attributes,
	$rendered_content
);