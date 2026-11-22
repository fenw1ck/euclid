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
| `play` | Builds the construction, then watches the proof play out | 1, 2, 3, 5, 6, 7, 9–38 |
| `slide` | Drags one triangle onto another | 4, 8 |
| `read` | Checklist proof only, no figure yet | 39–48 (10 total) |

Features already in place: Solve it for me, One small step, zoom, double-click to colour a line, dependency map, citations.

### Engine tools for figures (in `index.html`)
- **`wrong` op** (the "pretend" move for proofs by contradiction): the learner drags a point along a set path, marked by a pulse and an arrow. Used in 6, 7 and 14.
- **Wedges**: shaded angle sectors used to compare and add angles. A wedge can slide (`off`) or turn (`rot`). Used in 7 and 13–21.
- **`lay` op**: the learner drags a triangle so one corner lands on a point; it then turns to lie along a given line, and the far corner becomes a new point. This stands in for copying an angle (Prop 23) plus cutting a length (Prop 3), which would otherwise need about 20 extra letters. Used in 24 and 26.
- **Paths** (phase key `paths`): thick coloured routes such as B→A→C, used to compare lengths added together. Used in 20 and 21.
- A `wrong` drag can also show what changes as the figure moves. In 19 the shaded angles change live as A is dragged.
- A `wrong` op can move extra points with it through an `also` map (`{C:(W,s)=>...}`), so a whole line can tilt about a point on it. Used in 27 (CD tilts about F) and 29 (AB tilts about G).
- **`ptx` op** (`["ptx","G","A","B","C","D"]`): an automatic point where line AB, pulled on past B, meets line CD, pulled on past D. It appears only if they meet beyond both ends. Used in 27 and 29 for the "lines meet" contradiction.
- **Phase keys** (the proof animation after the construction): `keep` shows only the listed points and hides construction clutter; `anim` moves things frame by frame (for example, a point snapping back, or a triangle spinning); `wedges` and `eqReset` control the angle shading and colours.
- A line that is already drawn counts as done, so the learner is never asked to draw it twice.
- **Point names**: auto-named points use A–Z without I and J, as Fitzpatrick's figures do (…G, H, K, L…). After Z come primes: A′, B′… then A′′. Inside the engine, unnamed points are `_0`, `_1`… until `relabel()` gives them letters.
- **Helper points are not labelled.** A point the engine makes while carrying out an earlier proposition, and that this proposition never names, is drawn as a small dot with no letter (the `HELP` set). To show one, name it in that `use` op's output map, e.g. `{K:"E"}`. The progress line never names a helper; it says "the glowing point" instead. `noLab:[...]` still hides labels on named points, e.g. P and Q in 37–38.
- **Label placement**: each label goes in the clearest direction around its point (away from lines, arcs and shaded angles), slightly preferring above, and dodges other labels and points (`labLayout`).
- **Segment keys**: a line between two one-letter points is keyed `"AB"` (letters sorted), as before. If either name is longer, the key uses a bar: `"A′|B"`. Always build keys with `sk(a,b)` and read them back with `ends(k)`, and never use `k[0]`/`k[1]`. Option strings such as `on:"AB"` and `pk:["AG"]` follow the same rule.
- **`pti` op** (`["pti","E","B","P","A","D"]`): an automatic point where whole lines BP and AD cross, once both are drawn. Used in 37 and 38 to find where a new parallel meets the top line.
- **Area tools**: phase key `polys: [[["A","B","C","D"],6], …]` shades polygons (colour index into PAL; 6 is purple; -1 is a "cut out" piece, blank with a dashed edge). An `anim` that moves temporary points `s1`, `s2`… inside a polygon shows a shear (a parallelogram sliding along its parallels); used in 36–38. `dsegs0` gives dotted lines at the start. `lay` accepts `nosegs:1` and sets `W.laid`.
- A `use` op's "away:X" hint is translated only at the level where it is written, so it passes correctly through nested uses (for example 32 → 31 → 23).
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

- Fixed in Batch 5: figures no longer run out of letters.
- Fixed: double-letter names (which looked like lines) were replaced by primes, and helper points are unlabelled.

## Next

- Batch 1 (done): Props 6, 7, 13, 14, 15, 16, 17.
- Batch 2 (done): Props 18, 19, 20, 21.
- Batch 3 (done): Props 24, 25, 26. Prop 26 is built for its first case (equal side between the angles); the second case is described in the last step.
- Batch 4 (done): Props 27, 28, 29, 30. 27 and 29 use the "lines meet" contradiction: tilt a line, pull both lines on until they meet, then swing it back. 28 and 30 compare angles by spinning or sliding a wedge.
- Batch 5 (done): letter limit lifted (AA, AB, …), then Props 31, 32, 33, 34. 31 carries out Prop 23 inside the figure. 32 carries out 31, and slides the angles at A and B over to C. 33 and 34 spin triangle ABC half a turn onto DCB.
- Labelling (done): helper points unlabelled, I and J skipped, primes after Z, labels placed in the clearest spot. Prop 23's last point was renamed J → K to match.
- Batch 6 (done): Props 35, 36, 37, 38. 35 follows the Area pattern: lay triangle ABE on DCF, cut out DGE, shade both parallelograms purple. 36–38 slide one shape along the parallels into the other. 37 and 38 carry out Prop 31 twice each.
- Batch 7: Props 39–41 (39 and 40 are proofs by contradiction about area; 41 doubles a triangle into a parallelogram).
