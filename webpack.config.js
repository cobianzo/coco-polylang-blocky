/**
 * WordPress webpack configuration
 * Extended to support multiple entry points for blocks
 * and custom CSS file naming
 */

import defaultConfig from '@wordpress/scripts/config/webpack.config.js';
import { existsSync, readdirSync } from 'fs';
import path from 'path';

// Get all block directories and set up entries for JS and CSS
const getBlockEntries = () => {
    const srcPath = path.resolve(process.cwd(), 'src');
    const entries = {};

    // Add main entry point
    entries.index = path.resolve(srcPath, 'index.tsx');

    // Get all directories in src that contain block.json
    const blockDirs = readdirSync(srcPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .filter((dirName) => existsSync(path.resolve(srcPath, dirName, 'block.json')));

    // Add each block as an entry point
    blockDirs.forEach((blockDir) => {
        // Check if there's an index.tsx or index.js file
        const indexTsxPath = path.resolve(srcPath, blockDir, 'index.tsx');
        const editorCssPath = path.resolve(srcPath, blockDir, 'editor.css');
        const styleCssPath = path.resolve(srcPath, blockDir, 'style.css');

        if (existsSync(indexTsxPath)) {
            entries[`${blockDir}/index`] = indexTsxPath;
        }

        // Add editor.css if it exists
        if (existsSync(editorCssPath)) {
            entries[`${blockDir}/editor`] = editorCssPath;
        } else if (existsSync(path.resolve(srcPath, blockDir, 'index.css'))) {
            // Fallback to index.css for editor styles if editor.css doesn't exist
            entries[`${blockDir}/editor`] = path.resolve(srcPath, blockDir, 'index.css');
        }

        // Add style.css if it exists
        if (existsSync(styleCssPath)) {
            entries[`${blockDir}/style`] = styleCssPath;
        } else if (existsSync(path.resolve(srcPath, blockDir, 'style-index.css'))) {
            // Fallback to style-index.css for frontend styles if style.css doesn't exist
            entries[`${blockDir}/style`] = path.resolve(srcPath, blockDir, 'style-index.css');
        }
    });

    return entries;
};

// Import MiniCssExtractPlugin directly
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// Extend the default WordPress webpack config
export default {
    ...defaultConfig,
    entry: getBlockEntries(),
    output: {
        ...defaultConfig.output,
        path: path.resolve(process.cwd(), 'build'),
        filename: '[name].js',
    },
    // Configure CSS output filenames
    plugins: [
        ...defaultConfig.plugins.filter((plugin) => {
            // Keep all plugins except MiniCssExtractPlugin
            return plugin.constructor.name !== 'MiniCssExtractPlugin';
        }),
        // Add custom MiniCssExtractPlugin with filename configuration
        new MiniCssExtractPlugin({
            filename: ({ chunk }) => {
                // For editor.css and style.css, use the entry name
                if (chunk.name.endsWith('/editor') || chunk.name.endsWith('/style')) {
                    const blockDir = chunk.name.split('/')[0];
                    const cssType = chunk.name.split('/')[1]; // 'editor' or 'style'
                    return `${blockDir}/${cssType}.css`;
                }
                // For other entries, use the default naming
                return `${chunk.name}.css`;
            },
        }),
    ],
};
