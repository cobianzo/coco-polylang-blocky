/**
 * Language Switcher Block
 */
import { registerBlockType } from '@wordpress/blocks';

import { Edit } from './Edit';
import metadata from './block.json';
import { DynamicBlockConfig } from './types/block';
import './editor.css';
import './style.css';

/**
 * Register the block
 */
registerBlockType(metadata as DynamicBlockConfig, {
	edit: Edit,
	save: () => null, // Dynamic block, rendering happens in PHP
});
