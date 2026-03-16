# Repository Guidelines

## Project Structure & Module Organization
This is a Vue 3 + TypeScript merchant admin app built with Vite.

- `src/views/`: feature pages (for example `goods/`, `order/`, `audit/`, `seckill/`).
- `src/components/`: reusable UI components (for example `table/`, `goods/`).
- `src/api/`: HTTP API modules grouped by business domain.
- `src/stores/`: Pinia stores.
- `src/router/`: route definitions.
- `src/utils/`: shared helpers (`http.ts`, money/image utilities, websocket).
- `src/styles/`: global styles.
- `public/`: static assets.
- `docs/`: feature design docs (for example `docs/seckill_design.md`).

Styling is based on Tailwind CSS (`@tailwindcss/vite`) plus scoped component styles where needed.

## Build, Test, and Development Commands
- `npm run dev`: start local Vite dev server.
- `npm run build`: run type-check then production build.
- `npm run build-only`: build without type-check.
- `npm run type-check`: run `vue-tsc --build`.
- `npm run lint`: run ESLint with auto-fix and cache.
- `npm run format`: run Prettier on `src/`.

Use Node version from `package.json` engines (`^20.19.0 || >=22.12.0`).

## Coding Style & Naming Conventions
- Tech stack: TypeScript + Vue SFC (`<script setup lang="ts">`).
- UI styling: prefer Tailwind CSS utility classes for layout/spacing/typography; use scoped CSS for component-specific polish.
- Formatting: Prettier (`singleQuote: true`, `semi: false`, `printWidth: 100`).
- Indentation: follow `.editorconfig` (2 spaces); keep file style consistent when editing.
- Linting: ESLint (`eslint.config.ts`), avoid unused vars unless prefixed with `_`.
- Async style: use `async/await` consistently; do not use chained `.then()/.catch()/.finally()` in business code.
- API error handling: `src/utils/http.ts` already handles backend business errors and request-error toasts (Element UI). Unless special handling is required (for example fallback logic, silent retry, custom UX), do not add extra `try-catch` only to call `ElMessage` again.
- Default values: for fallback/default assignment, use nullish coalescing (`??`) instead of logical OR (`||`) to avoid treating valid falsy values (`0`, `''`, `false`) as missing.
- Naming:
  - Vue components: PascalCase file names (for example `AuditDetailDialog.vue`).
  - Stores/API modules: concise domain names (for example `category.ts`, `audit.ts`).
  - Keep business fields aligned with backend contracts (`auditNo`, `goodsId`, etc.).

## Testing Guidelines
There is no dedicated unit-test framework configured yet. Minimum quality gate before PR:

1. `npm run type-check`
2. `npm run lint`
3. `npm run build`
4. Manual smoke test for changed pages/routes.

If you add tests later, colocate as `*.spec.ts` near source files or under `src/__tests__/`.

## Commit & Pull Request Guidelines
Recent history mostly uses short Conventional Commit prefixes (`feat:`, `chore:`). Follow:

- Commit format: `type(scope): summary` (example: `fix(audit): load detail by auditNo`).
- Keep commits focused and atomic.
- PR should include:
  - change summary and affected modules,
  - linked issue/task,
  - screenshots or short recordings for UI changes,
  - verification steps (commands run + manual checks).
