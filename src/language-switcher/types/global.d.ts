declare global {
    interface Window {
        polylangLanguages?: Array<{
            slug: string;
            name: string;
        }>;
        wp?: {
            ajax: {
                post: (action: string) => {
                    done: (callback: (data: any) => void) => any;
                    fail: (callback: () => void) => any;
                };
            };
        };
    }
}

export {};
