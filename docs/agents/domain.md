# Domain docs

## Before exploring

Read root CONTEXT.md and any relevant decisions in docs/adr/.

If these files do not exist, proceed silently. Domain modeling
creates them lazily when terms or decisions are resolved.

## Layout

This repo uses a single context:

- CONTEXT.md: domain vocabulary and model.
- docs/adr/: architecture decision records.

## Vocabulary

Use terms defined in CONTEXT.md when naming domain concepts
in issues, proposals, hypotheses, and tests.

If a needed term is missing, reconsider whether it belongs
or note the gap for domain modeling.

## Decision conflicts

Explicitly flag proposals that contradict an existing ADR,
identifying the ADR and explaining why it should be revisited.
