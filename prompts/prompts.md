
## Initial Prompt (Opencode plan mode):

You are working in an existing monorepo for an HR applicant tracking system.

Repo context:
- Backend: Node.js + Prisma
- Frontend: React
- Goal: add tests that catch real bugs and regressions, especially in core ATS workflows

Your mission:
1. Inspect the repository first.
2. Identify the current testing setup, gaps, and the most bug-prone areas.
3. Propose a concise, risk-based testing plan.
4. Implement tests in small, high-value batches.
5. For existing catched bugs first implement the tests to verify they are failing in a TDD fashion.
6. Once the test fails, fix the bug with the minimum code required to make it work 
7. Prefer tests that protect business logic and user journeys over high coverage numbers.

Primary objectives:
- Catch regressions before release
- Detect edge cases, invalid inputs, and permission failures
- Protect critical hiring workflows
- Verify frontend behavior from the user’s perspective
- Cover backend services, API routes, Prisma interactions, and integration points

High-risk ATS areas to prioritize:
- Candidate creation, update, and deduplication
- Job posting CRUD
- Application submission and review flows
- Candidate stage/status transitions
- Search, filtering, sorting, and pagination
- Authentication and authorization
- Role-based access control
- Validation and error handling
- Prisma relational integrity and transaction-sensitive code
- Frontend forms, async loading, empty states, and error states
- End-to-end recruiter and candidate journeys

Testing strategy:
- Start with the highest-risk logic first
- Prefer integration tests where they give more confidence than unit tests
- Add unit tests for pure business rules and edge cases
- Add frontend tests for user-visible behavior, not implementation details
- Add E2E tests for the few critical paths that would break the product if regressed

Recommended stack, if compatible with the repo:
- Backend: Vitest or Jest + Supertest
- Frontend: React Testing Library + Vitest or Jest
- E2E: Playwright
- Prisma: dedicated test database or isolated test schema with clean reset between tests

What to look for before coding:
- Existing test framework and scripts
- Missing test helpers, fixtures, or factories
- Uncovered branches in services/controllers/components
- Bug-prone Prisma queries or state transitions
- Any brittle or outdated tests that should be improved instead of duplicated

Test cases to include:
- Happy path
- Invalid input
- Boundary conditions
- Permission denied
- Missing data / empty state
- Error handling
- Duplicate or repeated action where relevant
- Regression tests for any bug discovered during inspection

Implementation rules:
- Use Arrange / Act / Assert structure
- Keep mocks minimal and only where necessary
- Favor realistic fixtures over over-mocking
- Keep tests deterministic and isolated
- Avoid snapshot-heavy tests unless they truly add value
- Do not rewrite production code unless a small refactor is needed for testability
- If you find a bug, write a failing test first, then propose the minimal fix

Suggested first batch:
1. Backend tests for the most critical service logic and API routes
2. Frontend tests for forms, validation, loading, and error states
3. One or two Playwright flows for the highest-value recruiter/candidate journeys

Expected output:
- Short repo assessment
- Testing plan ranked by priority
- Files added/changed
- Implemented tests
- Any bugs or suspicious logic discovered
- Remaining gaps and next tests to add

Important:
- Optimize for catching real defects in production ATS workflows
- Focus especially on candidate lifecycle and recruiter actions
- If the repo already has a test pattern, follow it instead of introducing a new style
- Keep the changes small, stable, and easy to maintain

## Prompt 2 (Opencode plan mode):
As clarification there is a lot of code missing that I plan to add, I will add it using TDD but I want tests for the existing code

## Prompt 3 (Opencode plan mode):
Please make sure the test plan covers both main areas:
1. Receiving and handling form data.
2. Saving the data to the database.

We want at least one test for each process, so both the input flow and the persistence flow are covered.

## Prompt 4 (Opencode plan mode)::
If any of the tests would require modifying the database, remember that the ideal approach for unit tests is to mock the database interaction so no real data is altered.

If needed, you can follow Prisma’s guidance for this specific case:
https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client

# Prompt 5 (Opencode build mode):
Implement the changes following the plan. I need to review the test and see them fail especially in the case of the found bugs. Stop and ask me for review in these cases before proceeding
