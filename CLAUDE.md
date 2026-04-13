# Verbify — Project Memory for Claude

## General Principles

When fixing bugs, try the simplest solution first. Avoid creating new files, types, or abstractions when existing patterns (like validation rules, inline edits) already solve the problem.
After every file edit, run the TypeScript compiler to check for errors before moving to the next change. If there's a build error, fix it immediately before continuing.
Before making any changes, describe your proposed approach in 2-3 sentences. Prefer the simplest solution that uses existing patterns in the codebase. Wait for approval before implementing.
Before implementing a feature, use an agent to find 2-3 similar patterns in the codebase. Show how existing components handle the relevant UI pattern (inline editing, modals, dropdowns, list views) so we match established conventions.

## UI/Styling Rules

- After making UI changes, check for duplicate padding/spacing by reviewing both the new code AND the parent/wrapper component styles. Never add padding without checking what the container already provides.
- Before implementing a UI pattern (modal, sheet, dropdown), check if the codebase already has a similar pattern elsewhere and match it. Prefer inline editing over modals when the rest of the app uses inline patterns.

## What this project is

White-label SaaS platform for language schools. Teachers build lessons using a block-based
editor (similar to Notion). Schools get their own branded environment. Students take lessons
and track progress. Billing via Stripe subscriptions.

## Project location

/Volumes/LEO_SSD/work/pet-projects/verbify

## Stack

- Next.js 16 App Router, TypeScript strict, src/ folder, pnpm
- Supabase: auth + postgres + storage + RLS
- Tailwind CSS v4 + shadcn/ui (customized, black/white design system)
- Framer Motion, @dnd-kit/core, Tiptap, next-intl (uk/en)
- Stripe subscriptions, Zustand for client state, Zod for validation

## Architecture

- app/ — thin route shells only, no logic
- src/features/ — feature modules (auth, courses, lessons, lesson-builder, students, settings, billing, learn)
- src/shared/ — infrastructure (supabase clients, shared components, hooks, utils)
- Each feature: model/ api/ hooks/ components/ containers/ index.ts
- Pages import only from feature containers

## User roles

- owner: full access including billing and school settings
- teacher: courses, lessons, assigned students
- student: learn view only

## Database & Supabase

All tables have school_id (multi-tenancy). RLS isolates data per school.
When implementing features that involve Supabase RLS policies or database migrations, test the RLS policy for infinite recursion and verify permissions before moving to frontend work. Always check that migrations don't conflict with existing ones.
Key tables: schools, profiles, courses, lessons, lesson_blocks, student_progress, enrollments
Types generated at: src/shared/types/database.ts

## i18n

next-intl, defaultLocale: uk, supported: [uk, en]
Translation files: messages/uk.json, messages/en.json
Locale stored in cookie `verbify_locale`, server action in src/shared/lib/locale.ts
All UI strings must come from translation files — no hardcoded text.
Always verify translation keys match the exact casing and format used in the codebase (snake_case vs camelCase). Check existing translation files for conventions before adding new keys.

## Design system

Black/white palette. CSS variables in globals.css.
Font: Geist (via next/font/google). Notion-like lesson builder.
Never use Inter, purple gradients, or heavy shadows on resting elements.

## Lesson builder

Block-based editor. Blocks: text (Tiptap), quiz, flashcards, audio, video, embed (iframe).
Autosave: 500ms debounce -> Supabase upsert. State in builder.store.ts (Zustand).
Drag and drop via @dnd-kit. Block order stored as order_index in lesson_blocks table.

## Stripe plans

starter: $29/mo, $290/yr — 50 students, 2 teachers
pro: $59/mo, $490/yr — 200 students, 10 teachers
business: $99/mo, $990/yr — unlimited
Webhook handler: app/api/stripe/webhook/route.ts

## Env vars

NEXT*PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE*\*\_PRICE_ID (6 price IDs for 3 plans x 2 billing periods)

## Code conventions

- Comments: English only, no emoji
- Imports: absolute via @/ aliases, sorted by prettier-plugin-sort-imports
- No any, no relative imports, no hardcoded UI strings
- Pre-commit: Prettier via lint-staged + husky

## Completed features

- [2026-03-30] Step 1: project bootstrap — Next.js 16, TypeScript, Tailwind v4, pnpm, next-intl (uk/en), Supabase clients, Stripe client, design system CSS variables, Geist fonts, Prettier + Husky + lint-staged, full folder structure, CLAUDE.md
- [2026-03-30] Step 2: database — migration pushed to Supabase Cloud (project ref: dbdnlbkcmdnmgmssoszv), all 7 tables live with RLS policies, TypeScript types generated, seed school "Spanish MK" inserted
- [2026-03-30] Step 3: auth — login/register pages, Supabase auth with signIn/signUp/signOut server actions, middleware with role-based redirects (owner/teacher -> /dashboard, student -> /learn), 3 seed users created (owner@test.com, teacher@test.com, student@test.com / test1234)
- [2026-03-30] Step 4: dashboard shell — sidebar with role-filtered nav, topbar with language switcher and sign out, mobile drawer nav, responsive layout
- [2026-03-30] Step 5: courses CRUD + lesson builder — course list/detail pages, create/delete courses, create/delete lessons, block-based lesson builder with text/quiz/flashcards/audio/video/embed blocks, Zustand store, autosave with 500ms debounce
- [2026-03-30] Step 6: student view — learn pages showing published courses and lessons, lesson player with quiz/flashcard/video/audio/embed renderers, progress tracking via student_progress table
- [2026-03-30] Step 7: billing — pricing page with 3 plans and monthly/yearly toggle, Stripe webhook handler (checkout.session.completed, subscription.updated/deleted, invoice.payment_failed)
- [2026-03-30] shadcn/ui initialized (base-nova style, zinc base color), components: button, input, label, card, dialog, popover, dropdown-menu, avatar, badge, separator, skeleton, tabs, textarea, select, switch, tooltip, sheet, sidebar
- [2026-04-02] Demo: EmbedBlock — Figma/Miro smart URL detection and auto-convert to embed URLs, inline Figma public access warning, live preview in editor, iframe rendering in student view (500px default height), Figma + Miro added to trusted embed origins
- [2026-04-02] Demo: Flashcard progress — FlashcardsPlayer saves progress to student_progress on completion with score (% of "I know" answers), shows completion screen with score
- [2026-04-02] Demo: Progress tracking — saveProgress now increments attempts counter instead of hardcoding to 1
- [2026-04-02] Demo: White label — school logo_url fetched and displayed in sidebar (with GraduationCap fallback) and student learn header; school name shown in student header instead of hardcoded "Verbify"

## Known issues

- supabase gen types writes CLI warnings (stderr) into stdout — must strip non-TS lines after generation
- shadcn/ui base-nova style uses @base-ui/react — does NOT support asChild prop on triggers (Dialog, Popover, Dropdown). Pass children directly.

## Common bug patterns

### base-ui Select shows raw value instead of label

base-ui `SelectValue` may display the raw `value` prop (e.g. a UUID) instead of the `SelectItem` children text. Fix: pass computed display text as children of `SelectValue`, e.g. `<SelectValue>{items.find(i => i.id === value)?.name || placeholder}</SelectValue>`.

### Date formatting causes hydration mismatch

Never use `toLocaleDateString([])` or `toLocaleDateString()` without an explicit locale — the empty locale array resolves differently on server vs client. Always pass the app locale from `useLocale()` mapped to a BCP 47 tag (uk -> uk-UA, en -> en-US).

### Hardcoded UI strings in component constants

Labels in arrays/objects defined outside the component (like `DURATION_OPTIONS`) are easy to miss during i18n. Always use translation keys in label arrays and resolve them with `t()` at render time.

## Decisions log

- [2026-03-30] TypeScript 6.0 deprecates baseUrl — using relative path prefixes (./) in paths instead.
- [2026-03-30] next-intl without locale prefix routing — using cookie-based locale with server action instead of URL-based routing. Keeps URLs clean.
- [2026-03-30] Tailwind CSS v4 with @tailwindcss/postcss instead of v3 config-based setup.
- [2026-03-30] Route groups (parentheses) don't create URL segments in Next.js App Router — using real path folders (app/dashboard/, app/learn/, app/login/) instead.
- [2026-03-30] Stripe client lazily initialized via getStripe() to avoid build-time errors when STRIPE_SECRET_KEY is not set.
- [2026-03-30] Auth barrel export (features/auth/index.ts) must NOT re-export server-only modules (auth.queries.ts, auth.mutations.ts) to avoid client component import errors. Client components import directly from feature subpaths.
