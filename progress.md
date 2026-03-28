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

Update:
- Continued the cleanup after the first Tailwind pass by reducing `src/App.css` from 1107 lines to 621 lines.
- Removed the unused legacy app/header/dashboard/event/layout selectors and kept only the live poker-table, card, chip, and shared utility styles that are still referenced.
- `npm run build` passes after the CSS reduction, and the production CSS bundle dropped from 40.44 kB to 34.26 kB.

TODOs / notes:
- The remaining legacy CSS is concentrated in the table felt, cards panel, seat chips, and responsive seat layout; that is the next Tailwind migration slice.
- TableView still uses a one-off styled `Link` for the back action instead of a shared primitive.
- Playwright-based visual verification still has not been rerun in this environment.

Update:
- Moved the shared UI layer from `src/shared/ui` to `src/components/ui`.
- Moved `cn` from `src/shared/lib/cn.ts` to `src/lib/cn.ts`.
- Updated all imports to use the new structure and kept `Panel` as the surface component name to avoid collision with the poker `Card` component.
- `npm run build` still passes after the move.

TODOs / notes:
- If we continue aligning with shadcn conventions, keep adding generic primitives under `src/components/ui` and avoid growing `src/shared/ui` again.

Update:
- Audited the borderline shared components and moved `ControlSection` and `InfoCard` out of `src/components/ui` into `src/components/table-detail`, since they are feature-specific.
- Added `src/components/ui/button-link.tsx` so router links can reuse the shared button styling instead of carrying one-off inline classes.
- Removed the now-empty `src/shared` directories.
- `npm run build` still passes after the cleanup.

TODOs / notes:
- Next useful design-system pass is deciding whether more router-aware primitives are needed, or whether `ButtonLink` is enough.
- The remaining big migration target is still the poker-table-specific CSS in `src/App.css`.

Update:
- Migrated the structural table-surface layout in `table-visuals.tsx` from legacy CSS classes to Tailwind utilities for the center panel, board/hole-card rows, empty states, and mobile/desktop seat wrappers.
- Kept the genuinely custom visual CSS for the felt, poker card rendering, seat chip skin, and seat-slot scaling in `src/App.css`.
- Removed the matching dead legacy selectors from `src/App.css`; the file is now down to 439 lines.
- `npm run build` still passes after the table-surface cleanup.

TODOs / notes:
- Remaining CSS-heavy areas are mostly the poker-card face rendering and seat-chip responsive styling. Those can stay CSS-backed unless we want a deeper rewrite.
- `table-felt` itself is still CSS-backed, which is probably reasonable unless we want to fully inline the visual treatment.

Update:
- Moved the `SeatChip` structure and responsive sizing from `App.css` into `table-visuals.tsx` utility classes.
- `App.css` is now down to 256 lines and mostly contains only the playing-card skin, seat-slot scaling, and table felt visuals.
- `npm run build` still passes after the seat-chip migration.

TODOs / notes:
- The remaining legacy CSS is now basically the true custom visuals: poker cards, felt/rail, and desktop seat-slot scaling.
- The generated CSS bundle got a bit larger after shifting chip styles into utilities; that is expected and not necessarily a problem.

Update:
- Moved the felt container and inner ring styling into `TableDetail.tsx`.
- Replaced desktop seat-slot scale classes with computed inline transforms in `table-visuals.tsx`.
- `src/App.css` is now down to 151 lines and is effectively just the playing-card skin plus responsive card sizing.
- `npm run build` still passes after the final structural migration.

TODOs / notes:
- The remaining question is whether we want to keep the card visuals in CSS, which is reasonable, or migrate those too for complete consistency.
- The generated CSS bundle continues to grow slightly as more utility classes replace handcrafted CSS; that tradeoff is expected.
