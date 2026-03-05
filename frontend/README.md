## Styling Approach

This project uses Tailwind CSS with a component-driven abstraction strategy.

Early development favored inline utility classes for rapid iteration. As the UI grew,
repeated layout and form patterns were extracted into reusable UI primitives
(e.g. FormInput, FormCard, PageContainer).

This preserves Tailwind’s benefits:

- no global CSS conflicts
- predictable styling
- fast iteration

while maintaining:

- readable JSX
- low cognitive overhead
- scalable structure

Conditional styling is handled via `clsx` to keep logic separate from markup.
