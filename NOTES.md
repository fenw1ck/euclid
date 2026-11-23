# Euclid Game: project notes

Interactive diagrams are built by the user with minimal wordage. Let intuition guide geometric understanding as the foundation of geometry. Euclid's proofs are presented in easily digestible format.

Live site: https://fenw1ck.github.io/euclid/

This file is the single source of truth for how the project is built. Anyone picking up the work (a person or an AI assistant) should read this first.

## Files

- `index.html`: the whole game, in one self-contained file.
- `Elements_Text_Fitzpatrick.pdf`: Richard Fitzpatrick's translation of the *Elements*, the reference for every figure.
- `NOTES.md`: this file.

## Book I: build status

| Mode | What the learner does | Propositions |
|---|---|---|
| `play` | Builds the construction, then watches the proof play out | 1, 2, 3, 5, 6, 7, 9–44 |
| `slide` | Drags one triangle onto another | 4, 8 |
| `read` | Checklist proof only, no figure yet | 45–48 (4 total) |

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
- **Area tools**: phase key `polys: [[["A","B","C","D"],6], …]` shades polygons (colour index into PAL; 6 is purple; -1 is a "cut out" piece, blank with a dashed edge). An `anim` that moves temporary points `s1`, `s2`… inside a polygon shows a shear (a parallelogram sliding along its parallels); used in 36–38. `dsegs0` gives dotted lines at the start. `lay` accepts `nosegs:1` and sets `W.laid`. `polys0` shades areas from the start (e.g. the triangles we are told are equal in 39 and 40).
- An op with `needMoved:1` waits until the pretend (`wrong`) move is done. Used in 39 and 40, so E or F is found on the tilted line even if the learner draws the parallel first.
- A `use` op's "away:X" hint is translated only at the level where it is written, so it passes correctly through nested uses (for example 32 → 31 → 23).
- "Watch the proof again" restarts from the figure as it was before the proof animation began.
- **Tidy-up after a `use`** (visual only): once every step of a "Use Proposition N" is done, its unlabelled helper points, the lines and rays touching them, and its circles are no longer drawn, and Fit ignores them. Logic is unchanged. `hideSegs:[...]` hides named segments left over from a use (e.g. `DE` in 42).
- **Short versions (`BYID_Q`)**: every `use` runs the used proposition's short version by default. Short versions: 2 → `cpy` (the copied length, drawn 60° below the line from the given end), 3 → `cut` (equal piece cut off, shown pink with the given line), 9 → `bis`, 10 → `midp`, 11 → `perp` (pick up/down), 23 → `ang` (pick up/down/right/away:X), 31 → `par` (runs from the point towards the end mapped to 31's `B`), 42 → `pgram` (FECG on the half base, with the given angle). A short version must produce every output name its callers map. Step counts after the change: 37 and 38 → 4, 39 and 40 → 5, 42 → 10, 43 → 9, 44 → 15.
- **Moving a whole shape**: `lay` also takes a polygon. `["lay","G",{tri:["N","T2","W","O"],to:["B"],dir:["A","B"],ns:["E","F","G"],take:["N","O","W"]}]` drags the shape so its first corner lands on B, turns it so its first side runs in the direction A→B, names the other corners' new spots E, F, G, draws the new outline, and stops drawing the `take` points (the copy that was moved). Stands in for Proposition 2. Used in 44.
- **Slower**: `FULLSET` holds the paths (e.g. `"0/2"`) of uses opened in full; each short op carries `prop` and `path`. Pressing Slower adds the next step's path, rebuilds the ops and keeps finished steps done by matching them by content. Reset on load.
- **Cases** (`cases:[{lab},{lab,...overrides}]`): one proposition with several figures. Chips above the figure switch case; a case overrides goal, pts, segs0, eq0, wedges0, polys0, dsegs0, ops, steps, phases, winTxt. Used in 26.
- **`tags`**: free text labels, e.g. `tags:[["C",[x,y]]]` names triangle C in 44.
- Phase key `dropSegs` removes segments for the proof animation.
- **Direction of a helper parallel**: inside Prop 31, the new line runs from the point towards the end mapped to 31's `B` of the given line, so map `B` to the end on the side where the new point will be (e.g. `{A:"A",B:"C",C:"B"}` to run right).

## Design rules

### Figures
- **Every** proposition gets an interactive figure.
- The starting figure comes from the proposition's "Let…" sentence.
- The finished figure should match the diagram in the source (`Elements_Text_Fitzpatrick.pdf`; Joyce's online edition is a second reference).

### Interaction
- The learner can only make moves that advance the proof.
- The figure flashes whatever the learner should touch next, with an arrow showing which way to drag.
- A proposition used inside another runs its **short version** (rule set 22 Nov 2026): the learner taps a flashing preview and a "Prop N" burst confirms it, so the step is still done in the figure, not just cited. Prop 1's short version is its two circles plus tapping the triangle. The learner can press **Slower** (top right of the figure) to do that step in full instead; it is only clickable when the next step is a short version, and it also works on short steps inside a full one (e.g. 44 → 42 → 10). A designer can force the full version with `{full:1}` in a `use` op's options.

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
- The project copy of `index.html` was found out of date on 22 Nov 2026, and Batch 7 was lost to a usage limit and rebuilt. Always upload the latest `index.html` to the project (and the GitHub repo) after each batch.
- Prop 43's "relies on" list includes 31, because the learner draws the lines through K.

## Next

- Batch 1 (done): Props 6, 7, 13, 14, 15, 16, 17.
- Batch 2 (done): Props 18, 19, 20, 21.
- Batch 3 (done): Props 24, 25, 26. Prop 26 is built for its first case (equal side between the angles); the second case is described in the last step.
- Batch 4 (done): Props 27, 28, 29, 30. 27 and 29 use the "lines meet" contradiction: tilt a line, pull both lines on until they meet, then swing it back. 28 and 30 compare angles by spinning or sliding a wedge.
- Batch 5 (done): letter limit lifted (AA, AB, …), then Props 31, 32, 33, 34. 31 carries out Prop 23 inside the figure. 32 carries out 31, and slides the angles at A and B over to C. 33 and 34 spin triangle ABC half a turn onto DCB.
- Labelling (done): helper points unlabelled, I and J skipped, primes after Z, labels placed in the clearest spot. Prop 23's last point was renamed J → K to match.
- Batch 6 (done): Props 35, 36, 37, 38. 35 follows the Area pattern: lay triangle ABE on DCF, cut out DGE, shade both parallelograms purple. 36–38 slide one shape along the parallels into the other. 37 and 38 carry out Prop 31 twice each.
- Batch 7 (done, rebuilt 22 Nov 2026): Props 39, 40, 41. In 39 and 40 the learner lifts D off the parallel, draws the real parallel through A (Prop 31), and sees a smaller triangle forced to equal a bigger one, so D drops back. In 41, triangle EBC slides to ABC and a half-turned copy fills the parallelogram.
- Old draft `Euclid, Book I.html` removed (Nov 2026).
- Batch 8 (done, 22 Nov 2026): Prop 26 second case (AB = DE faces the equal angles at C and F; pretend BC is longer than EF, cut BH = EF, then angle BHA = EFD = BCA, but BHA is an outside angle of triangle AHC, so Prop 16 says it is bigger; C slides back onto H), then Props 42–44. 42 bisects BC, copies angle D to E and draws two parallels; ABE = AEC (38), and FECG is double AEC (41). 43: tap K on the diagonal, draw the two parallels through K, then take equal halves from equal halves. 44: parallel through A, pull HB and FE on to meet at K, parallel through K; the complements are equal (43). All of 1–44 pass an automatic solve test in Chrome. Follow-up the same day: short versions of 2, 3, 9, 10, 11, 23, 31 and 42 now run wherever they are used; 44 starts from triangle C and angle D, taps out 42 and drags the result onto B (Proposition 2 added to its "relies on" list).
- Batch 9: Prop 45 (parallelogram equal to any rectilinear figure; repeated use of 44).
- Batch 10: Prop 46 (square on a given line).
- Batch 11: Props 47–48 (Pythagoras and its converse). 47 uses shears and purple shading; 48 can use `slide` mode like 4 and 8.
- Finish Book I: check all 48 figures against Fitzpatrick, test touch on mobile, check the dependency map.
