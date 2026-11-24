# Elemental Geometry: the Game (design)

The site's 48 propositions become a tomb you explore. Each proposition is a lock. You open a lock by building its figure, and the opened door leads to the propositions that depend on it. The interactive part follows the site's rule: almost no words, and you learn by doing.

File: `game.html` (one self-contained page, linked from the site's **Game** button). Everything is drawn and composed in code, so there are no image or sound files to host.

## 1. Opening scene (built)

About 38 seconds; skippable at any moment with any key, click or tap. The four lines of text ("When things are too big, too complex to be understood," / "we make connections, we simplify," / "we go back…" / "to the beginning.") are spread across the whole journey, starting in the night sky.

1. Night sky. Many stars fade in. 48 of them are the propositions, laid out as on the relationship map, and the map's lines draw themselves. The other stars fade.
2. The camera goes to 48, the most advanced proposition, and travels back along the chain of what it relies on, all the way to 1 (48 → 47 → 41 → 37 → 31 → 23 → 22 → 20 → 19 → 18 → 16 → 15 → 13 → 11 → 8 → 7 → 5 → 3 → 2 → 1). The road travelled glows gold.
3. Star 1 swells into the sun. We fly towards it among the planets, and the Earth swings across our path until it fills the view.
4. We fall through the atmosphere (cloud rushing past), a continent grows beneath us, and we drop towards a mountain at dusk with a temple on its shoulder.
5. The ruined temple: the camera sweeps up the great stairs to the doors.

## 2. The building model (how the map becomes architecture)

- **Halls.** Every proposition *n* is a hall (a long corridor with statues, paintings and torches). You enter hall *n* by opening lock *n*.
- **Doors in a hall.** Hall *n* only has doors to rooms that *n* opens: a door to *c* appears once everything else *c* relies on is solved, so *n* is the last thing needed. For example, hall 1 starts with just the door to 2; doors to 9, 10 and 11 appear once 3 and 8 (and 9, for 10) are solved. There are no ornamental doors, and no arch at the end: the end wall carries the hall's own finished figure.
- **Wall art.** Paintings along the walls show finished figures of the next propositions ahead (from the lock engine); near the end of the book, where there are none ahead, earlier ones hang instead.
- **Door states.**
  - *Open*: that proposition is solved.
  - *Amber*: every proposition it relies on is solved, so it is a valid next step. Several doors can be amber at once.
  - *Covered*: something it relies on is unsolved. The lock stays visible, but an iron cover sits over it.
- **Greenhouses (junctions).** A proposition that relies on two or more others is reached through a greenhouse: a lush, abandoned glasshouse with ivy and fountains, some of them still working. Every parent hall opens into the same greenhouse. Inside, the child's door is covered until all its parents are solved, and paths lead back to each parent hall. If you walk towards the covered door you see what you still need. If you walk the other way you reach the missing proposition's hall.
  - Example: 5 relies on 3 and 4. Halls 3 and 4 both lead into the "5" greenhouse. If 4 is unsolved, the path out of the greenhouse leads back to the front doors.
- **Front doors.** 1 and 4 rely on nothing, so they are the two front doors. 1 opens the left door. 4 opens the right door. Both locks glow amber from the start.
- Hall 1's doors come from the map: 2, 9, 10 and 11. (The brief mentioned "1.2 and 1.5", but 5 relies on 3 and 4, not on 1, so 5 is reached through the 3/4 greenhouse.)

## 3. Locks and the magic

- Each lock plate is a bronze disc carrying the proposition's starting figure: the "Let…" sentence, with no letters shown.
- At the point of touch, a gold light follows the finger. Only the moving point glows, never the whole line. It leaves a shooting-star trail that fades.
- Behind the light, the figure is cut into the bronze as a groove. The groove shines brightly when cut, then fades to a plain carved line that stays.
- When the figure is complete, the shape glows gold. Then come the sounds of tumbling locks, the bolt, creaking hinges and the door settling.
- **Built:** Prop 1. Sweep B round A and A round B; once the arcs pass the crossing point, the light finishes each circle by itself. The crossing point sparkles. Then join A and B to it.
- **Built:** Prop 4 (right front door). The plate shows two angles: AB and AC on one side, DE and DF on the other. Drag AC onto DF: each gets one cut tick. Drag DE onto AB: two ticks each. Drag the angle at A onto the angle at D: a cut arc at each. BC and EF are then cut in. Drag one triangle onto the other until a corner clicks onto its partner, then swing it round until it fits. The triangles glow gold and the door opens into Hall 4, which has 11 doors (5, 6, 10, 16, 24, 25, 26, 33, 34, 35, 47), all covered for now.
- **Built:** Props 2 and 3, on a general lock engine (`FIGS` in the code). A lock is a list of points, the given figure, and steps of six kinds: join a line, tap a faint triangle (an earlier lock's short version, Prop 1), pull a line on, sweep a circle (the light finishes it once the arc passes what it needs), carry a line onto a point (Prop 2's short version), and swing a line round a pivot (it can carry on round a second pivot while you hold). New locks are mostly data.
  - Prop 2: join AB; tap the triangle ABD; pull DB and DA on; sweep C round B to get F; sweep F round D to get E; swing AE round D onto BF, and keep going round B onto BC. AE and BC get one tick each.
  - Prop 3: carry CD to A (it lands as AG); sweep G round A onto AB at H. CD, AG and AH get one tick each.
- **Built:** Props 5–8. The engine gained the moves proofs need: tap a point onto a line, *pretend* (drag a point to a wrong spot to test an idea), flip a triangle over, drag one angle onto another, slide one triangle onto another, short arcs for circles too big for the plate, and the contradiction ending (the pretend point slides home and the made-up point merges into it). Equal angles get cut arcs: one arc, two arcs.
  - Prop 5: pull AB and AC on; tap F on BD; sweep F round A to G; join FC and GB; drag F onto G (triangle AFC turns over onto AGB, so FC = GB); drag the angle under the base at B onto the one at C; then the base angle at B onto the base angle at C.
  - Prop 6: the base angles are marked equal. Pretend AB is longer by dragging A along the arrow; carry AC onto B (it lands as BD); join DC; swing CD round C towards CA, and A slides home with D merged into it: AB = AC.
  - Prop 7: pretend a second apex: drag D out of C, with AD and BD ticked equal to AC and BC; join CD; match angle ACD to ADC; then try to match DCB to CDB. It rattles, because it can't, and D falls back into C.
  - Prop 8: three pairs of sides ticked 1, 2, 3; slide one triangle onto the other until it clicks and swings into place, and the angles at A and D get arcs.
- **Built:** Props 9–12. New moves: *short* (tap faint preview lines or a glowing spot, standing in for an earlier lock in one tap, as the triangle tap does for Prop 1) and tapping a glowing spot to place a point.
  - Prop 9: tap D on AB; sweep D round A onto AC at E; join DE; tap the faint triangle DEF (Prop 1); join AF. The two halves of the angle get one arc each.
  - Prop 10: tap the faint triangle ABC (Prop 1); tap the faint line from C (Prop 9 cuts the top angle in half), which meets AB at M; drag A onto B, so triangle CAM turns over onto CBM: AM = MB.
  - Prop 11: tap D on the line; sweep D round C to E; tap the faint triangle DEF (Prop 1); join CF. The two angles at C get one arc each, so both are right angles.
  - Prop 12: tap the glowing spot D below the line; join CD; sweep D round C until the circle crosses the line twice (F and G); join CF and CG; tap the glowing middle H (Prop 10); join CH.
- Hall doors now work. An amber door opens its lock, a solved door leads into its hall, and Back steps back through the halls you walked through. Each door's plate shows its lock's figure, cut or uncut. Amber doors without a lock yet say so.
- Equal parts on lock plates are marked the classic way, with cut ticks and arcs, since the plates are bronze and gold only.
- **Next:** port the site's proposition engine (the `OPS` steps and short versions) so that any proposition's figure can sit on a lock plate. The engine stays the same; only the drawing and the effects change.

## 3a. Lettering, help, replay and the map (built)

- **Lettering.** Every lock plate carries its number (1.n) cut across the top like a coin, and its name along the bottom, upright and reading left to right. The figure sits inside an inner ring and never overlaps the lettering.
- **Help.** The ? button in a lock plays a pale blue ghost hand through the next move, twice. Moves that carry or swing a line show where they should land (a dashed target and an arrow), and they accept a loose drop. (Later this can cost a scroll.)
- **Continue or Start over.** With a saved game, the title screen offers Continue (straight to the doors) or Start over (tap twice to confirm; it erases progress and plays the opening).
- **Replay.** In any hall, ↺ Lock plays that hall's lock again without changing progress.
- **Map.** The Map button (at the doors and in halls) shows all 48 as stars: gold solved, glowing amber ready, grey locked, with a blue ring where you are. Tap a solved star to walk into its hall, or a ready one to open its lock. Shops will be marked here once they exist.

## 4. Treasure, coins and the statue shop

- **Chests** are hidden in halls and greenhouses. Opening one gives 1–20 coins, weighted by the hall's proposition number *n* (`coinRoll(n)` in the code). The weights follow a bell curve centred at 1 + 19·(n−1)/47, with a spread of 1.6:
  - in hall 1, about 3 chests in 4 give 1–2 coins;
  - in hall 47, nearly 9 in 10 give 18–20.
- **Statue shop.** One statue stands in every greenhouse. It glows blue, not gold, and sparkles as you pass. Sell items to it for coins, and buy scrolls with coins.
- **Scrolls** are single-use guides. Inside a lock, a scroll makes the light run ahead of your hand through each step, so you can follow it. This reuses the site's Solve/Step hand.
- **Clothes** are ornamental and dress your character: necklace, sword, boots, cape, gloves, crown.

### The 30 items (all in `ITEMS` in the code)

| # | Item | Kind | Price | Description |
|---|---|---|---|---|
| 1 | Scroll of Circles | scroll | 15 | Light runs ahead of your hand through any lock built from circles (Props 1–3, 22). |
| 2 | Scroll of the Straightedge | scroll | 15 | Shows each cut and join before you make it, for the line locks (Props 9–12). |
| 3 | Scroll of Angles | scroll | 20 | Guides the hand through the angle locks (Props 13–26). |
| 4 | Scroll of Parallels | scroll | 25 | Traces the lines that never meet (Props 27–34). |
| 5 | Scroll of Equal Areas | scroll | 30 | Shows which shape slides onto which (Props 35–45). |
| 6 | Scroll of Squares | scroll | 40 | The last three locks, step by glowing step (Props 46–48). |
| 7 | Lapis Pendant | necklace | 12 | A blue stone cut as a perfect hexagon on a braided cord. |
| 8 | Golden Ratio Torc | necklace | 30 | A neck ring whose spirals grow by the same proportion every turn. |
| 9 | Bronze Gnomon Blade | sword | 18 | Its blade casts a shadow that tells the hour. Ornamental, and sharp only in theory. |
| 10 | Starmetal Sword | sword | 40 | Forged from a fallen star; its edge is a perfectly straight line. |
| 11 | Scholar's Sandals | boots | 8 | Worn smooth by a thousand walks between the columns. |
| 12 | Greaves of the Long Stair | boots | 22 | Bronze shin guards etched with a staircase of squares. |
| 13 | Indigo Night Cape | cape | 14 | Dyed the colour of the sky before the stars were joined. |
| 14 | Constellation Cloak | cape | 35 | Its stitching maps the 48 stars and every line between them. |
| 15 | Linen Drafting Gloves | gloves | 6 | Keep the chalk off your fingers and the fingers off the chalk. |
| 16 | Gilded Gauntlets | gloves | 28 | The fingertips glow faintly gold, as if they remember every figure. |
| 17 | Laurel Wreath | crown | 10 | Given to those who prove what others only suspect. |
| 18 | Crown of the Elements | crown | 60 | Five points for five postulates. Found only in the deepest halls. |
| 19 | Silver Chalice | treasure | 16 | Its rim is a perfect circle; its stem, a perfect line. |
| 20 | Brass Astrolabe | treasure | 34 | Turn the rings and the stars line up, much as they did at the gate. |
| 21 | Iron Compass | treasure | 20 | A drawing compass that collapses when lifted, just as Euclid's did. |
| 22 | Ebony Straightedge | treasure | 20 | No markings at all. It can join, but it cannot measure. |
| 23 | Tortoiseshell Lyre | treasure | 26 | Its strings are tuned in whole-number ratios. |
| 24 | Mosaic Tile | treasure | 5 | A single blue triangle from a floor long since buried. |
| 25 | Painted Amphora | treasure | 14 | Black figures walk around it, forever drawing circles. |
| 26 | Bronze Oil Lamp | treasure | 9 | Still holds a little oil. It smells of old libraries. |
| 27 | Signet Ring | treasure | 24 | The seal is a triangle inside a circle inside a square. |
| 28 | Papyrus Map | treasure | 18 | A plan of the halls, though some corridors are drawn where none exist yet. |
| 29 | Marble Bust Fragment | treasure | 30 | A bearded face, chipped at the nose. Possibly a geometer. |
| 30 | Glass Hourglass | treasure | 22 | The sand falls in a perfect cone, every time. |

Proposed rules (open to change):
- The statue buys items at half price and sells scrolls at full price.
- Deeper halls drop rarer items.

## 5. Sound

- **Music:** ten songs in a dungeon-crawl style, but bright (adventure, curiosity, fun). Drums lead (kick, snare backbeat, hats, fills on every song); the lead line is kept soft. They are composed in code from a seed: a melody, bass, pad, arpeggio and drums, with an echo like a stone room. Each song plays twice, then the next one starts.
  - Songs: The First Postulate, Lantern Corridor, Compass and Ivy, Gnomon's March, The Greenhouse Fountain, Parallel Halls, The Gilded Theorem, Stairs of Alexandria, Byrne's Colours, Q.E.D.
  - The bottom-right corner always has: on/off, a song list, next song, and a volume slider.
- **Effects (built):** unlock (tumblers, then bolt, creak and thud), chimes as each part of the figure is cut, ticks while sweeping, and a rattle on a closed door.
- **Next:** running water near working fountains, louder as you approach; a chest creak and the clink of coins; and the shimmer of the blue statue.

## 6. Build phases

1. **Done (this build):**
   - the title screen and the opening scene;
   - the front doors, with the Prop 1 lock and its gold light and etching;
   - the unlock sound and the door opening;
   - Hall 1, with doors in amber or covered states;
   - the Prop 4 lock on the right front door, and Hall 4 behind it (halls now lay out any number of doors);
   - the ten songs and the volume control;
   - the item data and the coin roll;
   - the progress save.
2. **Locks for all 48:** Props 1–12 are done, and walking between halls works. Next: 13–16 (angles on a line, vertical angles, the exterior angle).
3. **Greenhouses:** junctions, fountains with water sound, the blue statue shop, chests and coins, and an inventory and character screen with clothes.
4. **Scrolls** (guided mode), more art variety for halls (different statues, paintings showing each hall's own figure), and phone testing across all 48.

## 7. Art note

All art is drawn in code (canvas): stars, the solar system, the temple, stone walls, ivy, bronze plates, wooden doors, and halls in perspective. This keeps the game to one small file and sharp at any screen size, but the style is clean and illustrated rather than painted. If painted art is wanted later, each scene has a single drawing function that an image could replace.
