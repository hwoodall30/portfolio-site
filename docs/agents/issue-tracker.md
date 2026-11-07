# Issue tracker: Local Markdown

Issues and specs live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Specs: `.scratch/<feature-slug>/spec.md`.
- Tickets: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`,
  numbered from 01, one file per ticket.
- Record triage state in a Status line near the top; use the
  role strings in `docs/agents/triage-labels.md`.
- Existing tickets use **Status:** and **Blocked by:** fields;
  preserve that formatting when editing them.
- Existing draft tickets remain pending their separate review.
  Setup does not approve them for implementation.
- Append conversation history under a ## Comments heading.

## Publish or fetch tickets

To publish, create a ticket file using the convention above.
To fetch, read the referenced file. Resolve bare ticket numbers
within the relevant feature directory.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes,
  Decisions-so-far, and Fog.
- Children: numbered files in `.scratch/<effort>/issues/`.
- Type records research, prototype, grilling, or task.
- Status records claimed or resolved during wayfinding.
- Blocked by lists prerequisite ticket numbers. A ticket is
  unblocked when every listed prerequisite is resolved.
- Frontier: choose the first open, unblocked, unclaimed ticket
  by number.
- Claim: save Status: claimed before starting work.
- Resolve: append an ## Answer, set Status: resolved, and add
  a summary and link to the map's Decisions-so-far.
