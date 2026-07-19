---
name: adaptations-feature
description: Data model + editor for strat "adaptations" (prioritized variations); view UI still pending
metadata:
  type: project
---

Feature adding **adaptations** to strats (prioritized variations shown based on operator bans). Editor + schema/queries built 2026-07-18; the **view UI is a separate follow-up step the user will spec later**.

Data model:

- `adaptations` table (convex/schema.ts): `stratID`, `name`, `index` (priority, lower first), `filters` (activate-only `adaptationFilter` — like `stratFilter` but NO hide/show action), `hiddenAssetIDs` (base placedAssets hidden when active).
- `placedAssets.adaptationID?`: when set, the asset belongs only to that adaptation.
- `Adaptation`/`AdaptationFilter` types in lib/types/strat.types.d.ts; `Strat.adaptations`; `BaseAsset.adaptationID`.

Convex (convex/strats.ts): `getAdaptations` helper loaded into `getStrat`/`list`; `createAdaptation`, `updateAdaptation`, `deleteAdaptation` (deletes its own assets + repacks indexes), `reorderAdaptations`. `createCopy` remaps the adaptation↔asset circular refs. `deleteAssets` prunes dangling `hiddenAssetIDs`.

Editor: new "Adaptations" sidebar tab (components/StratEditor/sidebar/Adaptations.tsx + AdaptationFilter.tsx). StratEditor holds `activeAdaptationID`; canvas shows base assets + active adaptation's assets, dims base assets (grayscale for hidden ones). Newly placed assets get the active adaptationID. AssetMenu shows an Eye/EyeOff "hide in adaptation" toggle for base assets while editing.

View (built 2026-07-19): `lib/adaptations.ts` holds pure helpers — `resolveAutoAdaptation` (top/lowest-index adaptation whose filters match; a filter reuses the banned/available + any/all hit logic; multiple filters per adaptation are AND'd (all must match; empty-operator filters ignored)), `resolveSelectedAdaptation(strat, selection, bannedOps)`, `applyAdaptationToAssets`. Selection is a string: null/"auto" → auto-resolve, "none" → base strat, or an adaptation id. `StratViewer` takes an `adaptation` prop and merges assets. `StratDisplay` resolves it, renders `AdaptationSelector` (shadcn Select) inline in the name header (only when `!drawingID && adaptations.length>0`); read-only when no `onChange`.

- Default view (`/strat/[id]` → page.client): selection stored in `?adaptation=` URL search param (shareable). `useSearchParams` wrapped in `<Suspense>`.
- Active/synced view (`/` → ActiveStrat): selection stored on `activeStrats.adaptationSelection` (schema), read via `activeStrat.getAdaptationSelection`, set via `activeStrat.setAdaptation` — only when `isLeading` (others follow). `activeStrat.set` resets the selection to auto on strat change.
