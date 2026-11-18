import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = 'Inventra';

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : `${appName} · Monitoring Aset Sekolah`),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#0d9488',
        showSpinner: false,
    },
});
