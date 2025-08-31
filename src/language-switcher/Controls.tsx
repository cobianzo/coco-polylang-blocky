import React from 'react';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface ControlsProps {
    layout: string;
    hide_current: boolean;
    show_flags: boolean;
    onChangeLayout: (newLayout: string) => void;
    onChangeHideCurrent: (hide: boolean) => void;
    onChangeShowFlags: (show: boolean) => void;
}

/**
 * Inspector Panel Controls for Language Switcher
 */
export const Controls = ({
    layout,
    hide_current,
    show_flags,
    onChangeLayout,
    onChangeHideCurrent,
    onChangeShowFlags,
}: ControlsProps) => {
    return (
        <InspectorControls>
            <PanelBody
                title={__('Language Switcher Settings', 'coco-polylang-blocky')}
                initialOpen={true}
                className="language-switcher-editor-panel"
            >
                <SelectControl
                    label={__('Layout Style', 'coco-polylang-blocky')}
                    value={layout}
                    options={[
                        { label: __('List', 'coco-polylang-blocky'), value: 'list' },
                        { label: __('Dropdown', 'coco-polylang-blocky'), value: 'dropdown' },
                    ]}
                    onChange={onChangeLayout}
                    help={__('Choose how the language switcher should be displayed.', 'coco-polylang-blocky')}
                />

                <ToggleControl
                    label={__('Show flags', 'coco-polylang-blocky')}
                    checked={show_flags}
                    onChange={onChangeShowFlags}
                    help={__('Display flag icons next to language names.', 'coco-polylang-blocky')}
                />

                <ToggleControl
                    label={__('Hide current language', 'coco-polylang-blocky')}
                    checked={hide_current}
                    onChange={onChangeHideCurrent}
                    help={__('Do not show the currently active language in the switcher.', 'coco-polylang-blocky')}
                />
            </PanelBody>
        </InspectorControls>
    );
};
