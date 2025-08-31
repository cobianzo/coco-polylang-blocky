import { registerBlockType, createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { TabPanel, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';

// Import block editor components directly from window.wp
// This avoids TypeScript errors with missing exports
declare const wp: any;
const { useBlockProps, InnerBlocks } = wp.blockEditor;

interface Language {
  slug: string;
  name: string;
}

interface BlockAttributes {
  className?: string;
  layout?: { type: string };
}

declare global {
  interface Window {
    polylangLanguages: Language[];
    wp: any;
  }
}

const getPolylangLanguages = (): Promise<Language[]> => {
  return new Promise((resolve) => {
    if (window.polylangLanguages && Array.isArray(window.polylangLanguages)) {
      resolve(window.polylangLanguages);
      return;
    }

    if (window.wp && window.wp.ajax) {
      window.wp.ajax.post('get_polylang_languages')
        .done((data: Language[]) => resolve(data))
        .fail(() => {
          resolve([
            { slug: 'es', name: 'Español' },
            { slug: 'en', name: 'English' },
          ]);
        });
    } else {
      resolve([
        { slug: 'es', name: 'Español' },
        { slug: 'en', name: 'English' },
      ]);
    }
  });
};

interface EditProps {
  attributes: any;
  setAttributes: (attrs: any) => void;
  clientId: string;
}

interface BlockInstance {
  attributes?: {
    className?: string;
  };
}

const PolylangLanguageContentEdit = ({ attributes, setAttributes, clientId }: EditProps) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  const { innerBlocks } = useSelect((select: any) => {
    return {
      innerBlocks: select('core/block-editor').getBlocks(clientId),
    };
  }, [clientId]);

  const { replaceInnerBlocks } = useDispatch('core/block-editor');

  useEffect(() => {
    getPolylangLanguages().then((langs) => {
      setLanguages(langs);
      setIsLoading(false);
      if (langs.length > 0 && !activeTab) {
        setActiveTab(langs[0].slug);
      }

      if (!initialized && langs.length > 0) {
        const existingLanguages = innerBlocks.map((block: BlockInstance) =>
          block.attributes?.className?.match(/language-content-([a-z]+)/)?.[1]
        ).filter(Boolean);

        const missingLanguages = langs.filter(lang =>
          !existingLanguages.includes(lang.slug)
        );

        if (missingLanguages.length > 0 || innerBlocks.length === 0) {
          const allLanguageBlocks: any[] = [];

          langs.forEach(lang => {
            const existingBlock = innerBlocks.find((block: BlockInstance) =>
              block.attributes?.className?.includes(`language-content-${lang.slug}`)
            );

            if (existingBlock) {
              allLanguageBlocks.push(existingBlock);
            } else {
              const newBlock = createBlock('core/group', {
                className: `language-content-${lang.slug}`,
                layout: { type: 'constrained' },
              }, [
                createBlock('core/paragraph', {
                  placeholder: `Content in ${lang.name}...`,
                }),
              ]);
              allLanguageBlocks.push(newBlock);
            }
          });

          replaceInnerBlocks(clientId, allLanguageBlocks, false);
        }
        setInitialized(true);
      }
    });
  }, [initialized, innerBlocks.length, activeTab, clientId, replaceInnerBlocks, innerBlocks]);

  if (isLoading) {
    return (
      <div {...useBlockProps()}>
        <Spinner />
        <p>{__('Loading Polylang languages...', 'coco-polylang-blocky')}</p>
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div {...useBlockProps()}>
        <p>{__('No languages found in Polylang.', 'coco-polylang-blocky')}</p>
      </div>
    );
  }

  const tabs = languages.map(lang => ({
    name: lang.slug,
    title: lang.name,
    className: `tab-${lang.slug}`,
  }));

  return (
    <div {...useBlockProps()}>
      <div className="polylang-content-block-editor">
        <TabPanel
          className="polylang-language-tabs"
          activeClass="active-tab"
          tabs={tabs}
          onSelect={(tabName: string) => setActiveTab(tabName)}
          initialTabName={activeTab}
        >
          {(tab: {name: string}) => {
            const currentLanguage = languages.find(l => l.slug === tab.name);

            return (
              <div className={`language-tab-content language-${tab.name}`}>
                <div className="language-containers">
                  <InnerBlocks
                    allowedBlocks={true}
                    template={false as any}
                    renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
                    __experimentalCaptureToolbars={true}
                  />
                </div>
                <style>{`
                  .block-editor-block-list__block[data-block="${clientId}"] .wp-block-group:not(.language-content-${tab.name}) {
                    display: none !important;
                  }
                  .block-editor-block-list__block[data-block="${clientId}"] .wp-block-group.language-content-${tab.name} {
                    display: block !important;
                  }
                `}</style>
              </div>
            );
          }}
        </TabPanel>
      </div>
    </div>
  );
};

const PolylangLanguageContentSave = () => {
  return <InnerBlocks.Content />;
};

// Registrar el bloque con la configuración completa
registerBlockType('coco-polylang-blocky/polylang-language-content', {
  apiVersion: 3,
  title: 'Polylang Language Content',
  category: 'text',
  icon: 'translation',
  description: 'Allows you to create specific content for each language configured in Polylang.',
  attributes: {
    languages: {
      type: 'object',
      default: {}
    }
  },
  edit: PolylangLanguageContentEdit,
  save: PolylangLanguageContentSave,
});