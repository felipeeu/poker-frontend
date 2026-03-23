Original prompt: Take a look for a card styling and add to project.

- Added card components and table board/hole-card panel.
- Added CSS for card visuals and face-down placeholders.

TODOs / notes:
- Run Playwright-based visual checks if needed.
- Adjust card sizing for mobile if required.

Update:
- Added card components and board/hole card UI in table detail.
- Added card styling CSS (face-up, face-down, empty slots).
- Tried to run Playwright client; missing playwright dependency.
- npm install -D playwright failed (EAI_AGAIN to registry.npmjs.org).

Update:
- Added disable logic for the `Open Table` button in `TableDetail`.
- Button is now disabled when there is no auth token, no selected table, the table is already open/active, or a hand is already in progress.
- Added a `title` message so the disabled reason is visible on hover.
- `npm run lint` still fails on pre-existing `no-explicit-any` errors in `src/components/TablesPanel.tsx`.
- `npm run build` still fails on pre-existing TypeScript errors in `src/api/client.ts` and `src/components/AuthPanel.tsx`.
- Started the Vite dev server successfully, but the shared Playwright skill script could not import `playwright` from its own location even though the project has a local dependency.

Update:
- Added a lightweight built-in i18n layer with `en` and `pt-BR` dictionaries in `src/i18n.ts`.
- Persisted the selected locale in the app store and added a language selector to the header.
- Migrated the main visible UI strings in `ApiHeader`, `AuthPanel`, `TablesPanel`, `EventsPanel`, `TableView`, and `TableDetail` to use translations.

Update:
- Improved UX with a global status banner, always-visible header controls on table routes, and clearer websocket labels.
- Added helper copy and a "use generated credentials" shortcut in the auth panel.
- Added table summary cards and clearer empty states in the tables dashboard.

Update:
- Reshaped the table screen toward a more familiar online poker aesthetic with a green felt arena, wood rail, centered board area, and a dedicated control rail.
- Shifted the app palette toward casino green and gold so the overall UI reads more like a poker client than a generic admin dashboard.
