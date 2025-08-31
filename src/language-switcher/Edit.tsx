import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { Controls } from './Controls';
import { usePolylangLanguages, Language } from './hooks/usePolylangLanguages';
import { LanguageSwitcherAttributes } from './types/block';

export interface EditProps {
    attributes: LanguageSwitcherAttributes;
    setAttributes: (attributes: Partial<LanguageSwitcherAttributes>) => void;
}

/**
 * Language Switcher Edit component
 */
export const Edit = ({ attributes, setAttributes }: EditProps) => {
    const { layout, hide_current, show_flags } = attributes;
    const { languages, isLoading } = usePolylangLanguages();
    const blockProps = useBlockProps();

    // Handle layout change
    const onChangeLayout = (newLayout: string) => {
        setAttributes({ layout: newLayout });
    };

    // Handle hide current change
    const onChangeHideCurrent = (hide: boolean) => {
        setAttributes({ hide_current: hide });
    };

    // Handle show flags change
    const onChangeShowFlags = (show: boolean) => {
        setAttributes({ show_flags: show });
    };

    // Show loading state
    if (isLoading) {
        return (
            <div {...blockProps}>
                <Spinner />
                <p>{__('Loading Polylang languages...', 'coco-polylang-blocky')}</p>
            </div>
        );
    }

    // Show message if no languages found
    if (!languages || languages.length === 0) {
        return (
            <div {...blockProps}>
                <p>{__('No languages found or Polylang is not active.', 'coco-polylang-blocky')}</p>
            </div>
        );
    }

    // Render the language switcher preview in editor
    return (
        <div {...blockProps}>
            <Controls
                layout={layout}
                hide_current={hide_current}
                show_flags={show_flags}
                onChangeLayout={onChangeLayout}
                onChangeHideCurrent={onChangeHideCurrent}
                onChangeShowFlags={onChangeShowFlags}
            />

            <div className="language-switcher-preview-simple">
                <p>{languages.map((lang: Language) => lang.slug.toUpperCase()).join(', ')}</p>
            </div>
        </div>
    );
};
