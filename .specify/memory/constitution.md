<!--
Sync Impact Report:
- Version Change: Initial (Template) → 1.0.0
- Bump Rationale: Initial formal ratification of the Habit Tracker constitution establishing core architectural principles, full-stack web tech stack standards, strict quality gates, and governance procedures.
- Principles Defined:
  1. I. Test-First Development (TDD & Automated Verification)
  2. II. Clean Architecture & Separation of Concerns
  3. III. Data Integrity & Resilient State Management
  4. IV. Strict Type Safety & Static Analysis
  5. V. Structured Observability & Predictable Error Handling
- Added Sections:
  - Technology Stack & Architectural Standards
  - Development Workflow & Quality Gates
  - Governance
- Removed Sections: None
- Templates Requiring Updates:
  - .specify/templates/plan-template.md: ✅ Aligned (Matches Web App / Next.js conventions and constitutional gates)
  - .specify/templates/spec-template.md: ✅ Aligned (Matches prioritized user stories and strict acceptance criteria)
  - .specify/templates/tasks-template.md: ✅ Aligned (Matches TDD flow, independent story phases, and quality standards)
- Follow-up TODOs: None
-->

# Habit Tracker Constitution

## Core Principles

### I. Test-First Development (TDD & Automated Verification)
- Feature development MUST follow a Test-Driven Development (TDD) cycle: Unit, integration, and contract tests MUST be authored and confirmed failing before implementation code is written.
- The project MUST maintain a minimum of 80% automated test coverage across all domain logic, services, and API handlers.
- Critical user journeys (habit creation, streak computation, completion logging, and history export) MUST have automated end-to-end or integration tests.
- Every bug fix MUST include an automated regression test that reproduces the defect prior to applying the fix.

*Rationale: Habit tracking logic relies heavily on date calculations, recurring schedules, and streak mathematics. Strict test-first discipline prevents regressions and guarantees reliability.*

### II. Clean Architecture & Separation of Concerns
- The codebase MUST strictly isolate Domain Entities & Business Logic (habit models, interval rules, streak calculators) from Data Persistence (Prisma ORM, SQLite/PostgreSQL) and Interface Layers (Next.js Server Actions, Route Handlers, UI Components).
- Core domain logic MUST remain pure, framework-agnostic, and independently testable without database or UI dependencies.
- UI components MUST focus strictly on presentation and user interaction, delegating business rule execution and state mutations to dedicated services or server actions.

*Rationale: Decoupling domain logic from the presentation framework and database allows seamless refactoring, simplifies unit testing, and ensures clean maintainability as features scale.*

### III. Data Integrity & Resilient State Management
- Habit logs, completions, and state transitions MUST be recorded with deterministic UTC timestamps and timezone awareness.
- Database schemas MUST be managed through versioned, deterministic Prisma migrations; destructive schema migrations without migration/backup plans are prohibited.
- Local/offline state synchronization and mutations MUST be idempotent to prevent duplicate completion logs or corrupted streak records.
- User data export and backup capabilities MUST be supported to prevent vendor lock-in and guarantee user data ownership.

*Rationale: Users trust habit trackers with their long-term progress; any data loss, duplicate entries, or timezone-related streak resets directly breaks user trust.*

### IV. Strict Type Safety & Static Analysis
- TypeScript strict mode MUST be enabled across the entire workspace with zero compiler errors and zero implicit `any` types.
- All external inputs (API payloads, route query parameters, environment variables, and local storage data) MUST be parsed and validated at the boundary using schema validators (e.g., Zod).
- Code MUST pass all linter (ESLint) and formatter (Prettier) checks with zero warnings before being merged.

*Rationale: End-to-end type safety and boundary schema validation catch bugs at compile time and input boundaries, eliminating entire classes of runtime exceptions.*

### V. Structured Observability & Predictable Error Handling
- Server actions, API endpoints, and background jobs MUST output structured JSON logs with contextual metadata (request ID, timestamp, operation name, user ID when applicable).
- Errors returned to the client MUST follow a consistent, predictable schema (e.g., standard error codes and human-readable messages) without leaking sensitive internal details or stack traces.
- Critical operations (such as data import/export or mass habit updates) MUST emit clear audit/diagnostic events to enable fast troubleshooting.

*Rationale: Structured logging and uniform error responses make debugging predictable, improve operational visibility, and enable rapid incident resolution.*

## Technology Stack & Architectural Standards

- **Core Framework**: Next.js (App Router), React, Node.js.
- **Language & Type System**: TypeScript (Strict Mode enabled).
- **Styling & UI**: Tailwind CSS with accessible, responsive UI component patterns.
- **Data Layer & ORM**: Prisma ORM with SQLite (development / local-first) and PostgreSQL (production / hosted).
- **Validation**: Zod for runtime schema validation and contract enforcement.
- **Testing Frameworks**: Vitest / Jest for unit and integration testing, Playwright for end-to-end workflow verification.

## Development Workflow & Quality Gates

- **Specification-Driven Process**: Every feature MUST proceed through the Spec Kit lifecycle:
  1. Specification (`spec.md`): Clarified functional requirements and prioritized user stories.
  2. Planning (`plan.md`): Technical context, architecture decisions, and Constitution compliance check.
  3. Task Breakdown (`tasks.md`): Phased, dependency-ordered tasks grouped by user story.
  4. Implementation: Executed story-by-story with TDD discipline.
- **Quality Gates**:
  - Automated tests pass with >= 80% coverage.
  - TypeScript compilation passes with zero errors.
  - Linting passes with zero warnings.
  - No constitution check violations unless explicitly documented and approved in `plan.md`'s Complexity Tracking section.

## Governance

- **Supremacy**: This Constitution is the authoritative reference for architectural, testing, and implementation standards in the Habit Tracker project. It supersedes informal conventions.
- **Amendment Procedure**:
  - Any constitutional amendment MUST be documented with clear rationale and impact analysis.
  - All dependent templates (`spec-template.md`, `plan-template.md`, `tasks-template.md`) MUST be reviewed and updated to align with the changes.
  - Version increments MUST strictly follow Semantic Versioning rules.
- **Versioning Policy**:
  - **MAJOR (X.0.0)**: Incompatible governance changes, removal or fundamental redefinition of core principles.
  - **MINOR (1.X.0)**: Addition of new principles, architectural standards, or materially expanded sections.
  - **PATCH (1.0.X)**: Non-semantic refinements, typo fixes, and wording clarifications.
  - **Compliance Reviews**: Every pull request, design review, and feature plan MUST undergo an explicit Constitution Check to ensure full adherence.

**Version**: 1.0.0 | **Ratified**: 2026-08-19 | **Last Amended**: 2026-08-19
