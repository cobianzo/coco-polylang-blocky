import { useEffect, useState } from '@wordpress/element';

/**
 * Custom hook to manage Polylang languages
 *
 * Returns an object with two properties:
 * - languages: An array of Language objects
 * - isLoading: A boolean indicating if the languages are being loaded
 *
 * Usage:
 *
 * const { languages, isLoading } = usePolylangLanguages();
 *
 * if (isLoading) {
 *     return <Spinner />;
 * }
 *
 * return (
 *     <ul>
 *         {languages.map((language) => (
 *             <li>{language.name}</li>
 *         ))}
 *     </ul>
 * );
 */

/**
 * Interface for Language object
 */
export interface Language {
    slug: string;
    name: string;
}

/**
 * Function to get Polylang languages
 * @returns {Promise<Language[]>} Promise that resolves to array of languages
 */
const getPolylangLanguages = (): Promise<Language[]> => {
    return new Promise((resolve) => {
        if (window.polylangLanguages && Array.isArray(window.polylangLanguages)) {
            resolve(window.polylangLanguages);
            return;
        }

        if (window.wp && window.wp.ajax) {
            window.wp.ajax
                .post('get_polylang_languages')
                .done(resolve)
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

/**
 * Custom hook to manage Polylang languages
 * @returns {Object} Object containing languages array and loading state
 */
export const usePolylangLanguages = () => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPolylangLanguages().then((langs) => {
            setLanguages(langs);
            setIsLoading(false);
        });
    }, []);

    return { languages, isLoading };
};
