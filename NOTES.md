# Euclid Game: project notes

Interactive diagrams are built by the user with minimal wordage. Let intuition guide geometric understanding as the foundation of geometry. Euclid's proofs are presented in easily digestible format.

Live site: https://fenw1ck.github.io/euclid/

This file is the single source of truth for how the project is built. Anyone picking up the work (a person or an AI assistant) should read this first.

## Files

- `index.html`: the whole game, in one self-contained file.
- `Euclid, Book I.html`: an older draft with 2 propositions. Kept for reference only.
- `sources/fitzpatrick.pdf`: Richard Fitzpatrick's translation of the *Elements*, the reference for every figure.
- `NOTES.md`: this file.

## Book I: build status

| Mode | What the learner does | Propositions |
|---|---|---|
| `play` | Builds the construction | 1, 2, 3, 5, 9, 10, 11, 12, 22, 23 |
| `slide` | Drags one triangle onto another | 4, 8 |
| `read` | Checklist proof only, no figure yet | 6, 7, 13–21, 24–48 (36 total) |

Features already in place: Solve it for me, One small step, zoom, double-click to colour a line, dependency map, citations.

## Design rules

### Figures
- **Every** proposition gets an interactive figure.
- The starting figure comes from the proposition's "Let…" sentence.
- The finished figure should match the diagram in the source (`sources/fitzpatrick.pdf`; Joyce's online edition is a second reference).

### Interaction
- The learner can only make moves that advance the proof.
- The figure flashes whatever the learner should touch next, with an arrow showing which way to drag.
- Earlier propositions are actually carried out inside the current figure, not just cited.

### Colour
- Equal parts share a colour, and each set of equal parts gets its own colour.
- The learner can mark equal parts by double-clicking to cycle a line's colour.

### Patterns for kinds of proof
- **Proof by contradiction** (6, 7, 14, 18–20, 27, …): the learner slides a point to a "wrong" spot, and the logic forces it back.
- **Area** (35–48, starting with Prop 35): mark equal sides, drag one triangle onto the other, cut out the shared piece, then shade both areas purple.
- **Parallels** (27–34): extend the dotted lines until they meet, which shows the contradiction.

### Lettering
- Keep the source's letters where the proposition names points up front.
- Otherwise, letter points alphabetically in the order they appear.

### Audience
- The interactive part needs no maths and no English.
- The written Logic section is for readers with strong maths.

## Known issues

- Figures run out of letters (only 26 single letters), which blocks Props 31, 42, 44–46 and 47.

## Next

- Batch 1: give figures to Props 6, 7, 13, 14, 15, 16, 17.
