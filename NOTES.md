# Euclid Game: project notes

Interactive diagrams are built by the user with minimal wordage. Let intuition guide geometric understanding as the foundation of geometry. Euclid's proofs are presented in easily digestible format.

Live site: https://fenw1ck.github.io/euclid/

This file is the single source of truth for how the project is built. Anyone picking up the work (a person or an AI assistant) should read this first.

## Files

- `index.html`: the whole game, in one self-contained file.
- `Euclid, Book I.html`: an older draft with 2 propositions. Kept for reference only.
- `Elements_Text_Fitzpatrick.pdf`: Richard Fitzpatrick's translation of the *Elements*, the reference for every figure.
- `NOTES.md`: this file.

## Book I: build status

| Mode | What the learner does | Propositions |
|---|---|---|
| `play` | Builds the construction, then watches the proof play out | 1, 2, 3, 5, 6, 7, 9–26 |
| `slide` | Drags one triangle onto another | 4, 8 |
| `read` | Checklist proof only, no figure yet | 27–48 (22 total) |

Features already in place: Solve it for me, One small step, zoom, double-click to colour a line, dependency map, citations.

### Engine tools for figures (in `index.html`)
- **`wrong` op** (the "pretend" move for proofs by contradiction): the learner drags a point along a set path, marked by a pulse and an arrow. Used in 6, 7 and 14.
- **Wedges**: shaded angle sectors used to compare and add angles. A wedge can slide (`off`) or turn (`rot`). Used in 7 and 13–21.
- **`lay` op**: the learner drags a triangle so one corner lands on a point; it then turns to lie along a given line, and the far corner becomes a new point. This stands in for copying an angle (Prop 23) plus cutting a length (Prop 3), which would otherwise need about 20 extra letters. Used in 24 and 26.
- **Paths** (phase key `paths`): thick coloured routes such as B→A→C, used to compare lengths added together. Used in 20 and 21.
- A `wrong` drag can also show what changes as the figure moves. In 19 the shaded angles change live as A is dragged.
- **Phase keys** (the proof animation after the construction): `keep` shows only the listed points and hides construction clutter; `anim` moves things frame by frame (for example, a point snapping back, or a triangle spinning); `wedges` and `eqReset` control the angle shading and colours.
- A line that is already drawn counts as done, so the learner is never asked to draw it twice.
- "Watch the proof again" restarts from the figure as it was before the proof animation began.

## Design rules

### Figures
- **Every** proposition gets an interactive figure.
- The starting figure comes from the proposition's "Let…" sentence.
- The finished figure should match the diagram in the source (`Elements_Text_Fitzpatrick.pdf`; Joyce's online edition is a second reference).

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

- Batch 1 (done): Props 6, 7, 13, 14, 15, 16, 17.
- Batch 2 (done): Props 18, 19, 20, 21.
- Batch 3 (done): Props 24, 25, 26. Prop 26 is built for its first case (equal side between the angles); the second case is described in the last step.
- Batch 4: Props 27–30, the first parallel-line tests (27 uses the "lines meet" contradiction).
