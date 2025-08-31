/**
 * Block metadata as a typed object.
 */
import { BlockConfiguration } from '@wordpress/blocks';

/**
 * Define the type for our block's attributes.
 */
export interface LanguageSwitcherAttributes {
  layout: string;
  hide_current: boolean;
  show_flags: boolean;
}

// The BlockConfiguration type from @wordpress/blocks doesn't include the 'render' property for dynamic blocks.
// We create a custom type that includes it and explicitly passes our attributes type.
export interface DynamicBlockConfig extends BlockConfiguration<LanguageSwitcherAttributes> {
  render?: string;
}
