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

Update:
- Added mobile-focused breakpoints for the header, status banner, table felt, seat layout, cards, and action buttons.
- Tightened spacing and stacking on small screens so the table view remains playable on phones.

Update:
- Reworked the header into a more game-like lobby bar with a brand mark, live status chips, and a compact control deck for API/language settings.

Update:
- Refined mobile seat-chip styling so player badges read as compact table tokens instead of just scaled-down desktop cards.
- Tightened chip width, padding, avatar sizing, and status pill sizing at phone breakpoints, and stacked the optional meta row vertically when space gets tight.

Update:
- Focused on mobile table styling in src/App.css.
- Gave the felt a stable minimum height and reserved center spacing so seats stay around the board on phones.
- Tightened phone-scale seat chip transforms and widths, and centered the card rows for narrower layouts.

Update:
- Split the table presentation into desktop and mobile layouts in TableDetail.
- Kept the existing absolute seat ring for desktop and added a mobile top-center-bottom seat flow around the shared table-center content.
- Reworked the mobile CSS so chips render in flexible rows above and below the cards instead of overlapping them.

Update:
- Extended the mobile/tablet table layout breakpoint to 1024px so seat chips stop overlapping the center cards in the 1024-760 range.

Update:
- Started the Tailwind migration on TableDetail.
- Replaced the old panel/button/input/status/control-card class stack with shared Tailwind UI primitives.
- Removed the matching unused table/control CSS from App.css; the felt, cards, and seat-chip visuals remain on legacy CSS for the next pass.
