# Repository Audit — P0-S2

Date: 2026-10-20
Auditor: P0-S2 session
Root: `/home/masoudkazakh/Desktop/qazTalent`

## 1. Pre-work state

| Item | Finding |
|---|---|
| Git repository | Not initialised (`Is directory a git repo: no`) |
| Application code | None |
| `package.json` | Did not exist |
| `src/` | Did not exist |
| `public/` | Did not exist |
| Tests | None |
| Build tooling | None |
| Existing docs | `prompt.md`, `prompt-development-plan.md`, `.opencode/skills/**` |
| Reusable product components | None |

Conclusion: this was an empty project apart from the specification and the installed design/motion skills. There was no working functionality to preserve and no risk of replacing a functioning application.

## 2. Decision recorded

Per `prompt.md` §0 ("If no repository exists, create the application using React, Vite, and TypeScript") and the plan §2, the project was scaffolded with:

- React 19 + Vite 7 + TypeScript 5.9 (strict mode)
- React Router 7 for routing
- Vitest + Testing Library (unit/integration), Playwright (E2E)
- Custom lightweight i18n (no runtime i18n dependency)
- localStorage adapter with versioned envelopes and corruption quarantine
- Custom service worker with cache versioning (no Workbox dependency)

No dependency was added without a concrete need. No UI framework or state library was introduced.

## 3. What must be preserved

1. `prompt.md` is the source of truth and must not be rewritten to fit implementation shortcuts.
2. `prompt-development-plan.md` ownership and evidence rules remain in force.
3. `.opencode/skills/**` is read-only tooling for design/motion guidance; product code must not depend on it at runtime.
4. `docs/*` research files contain sourced claims and must not be overwritten with unsourced marketing copy.

## 4. Forbidden rewrites

- Replacing the React/Vite/TS stack without explicit technical evidence and approval.
- Introducing a backend for browser-feasible features.
- Presenting simulated capabilities as working integrations.
- Copying invented statistics, testimonials, or partnerships into product copy or deliverables.

## 5. Runtime verification (post-scaffold)

| Check | Command | Result at audit |
|---|---|---|
| Type check | `npm run typecheck` | Passed |
| Production build | `npm run build` | Passed |
| i18n key parity | `npm run check:i18n` | Passed (3 languages × 10 namespaces at that point) |
| Unit tests | `npm test` | Not yet present (later phases) |

## 6. Known risks carried forward

- Kazakh and Russian safety translations require competent human review before release.
- Browser storage can be cleared by the OS/browser; export is the only backup.
- Real emergency contact verification has a limited validity window and must be re-checked before submission.
- No real user research has been conducted; all personas and problem statements are hypotheses.
