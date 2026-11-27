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

> **Replaced 27 Nov 2026 by section 3f** (the house comes first, the locks are put in its rooms). The rules below describe the first two buildings and are kept as history: greenhouses are no longer junctions, and halls no longer get doors from the dependency map.


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
- **Built:** Props 13–16. New moves: *spin* (turn a shaded angle about its own corner onto another) and *turn* (turn a triangle about a point until it lands on another); an angle match can also drop an angle in turned, to show it fits inside a bigger one; the win glow can light a whole angle.
  - Prop 13: tap the faint upright at B (Prop 11: two right angles, one arc each); swing BA round B down onto BC, and keep going round onto BD: the two angles together sweep the straight line.
  - Prop 14: pretend BD leaves the line (drag D up); pull CB on past B to E; swing BD round B onto BE, and D drops back onto the line.
  - Prop 15: join AE and pull it on to B; spin the angle CEA half a turn about E onto DEB (one arc each); then AED onto BEC (two arcs each).
  - Prop 16: pull BC on to D; tap the glowing middle E of AC (Prop 10); join BE and pull it on to F, as far again; join FC; turn triangle ABE half a turn about E onto CFE (the angles at A and C get an arc); drag the angle at A over to C: it sits inside the outside angle ACD, which lights up.
- **Built:** Props 17–20. An angle match can drop the angle in turned over (*mirror*), and a swing can leave its moved line showing (*keep*), to show it falls short. A contradiction can take back tick marks it made (*unmark*).
  - Prop 17: pull BC on to D; slide the angle at B over to C: it sits inside the outside angle ACD, and the angles at C light up along the straight line.
  - Prop 18: sweep B round A onto AC at D (AB = AD, one tick); join BD (the base angles of ABD get an arc); slide the angle at C up to D: it sits inside ADB.
  - Prop 19: drop the angle at C into the angle at B, turned over: it fits inside, so B is bigger. Pretend AB = AC by dragging A along the arrow, then try to match the angle at B to the angle at C. It rattles, and A slides back: AC is longer.
  - Prop 20: pull BA on past A; sweep C round A onto it at D (AD = AC); join DC (equal base angles); swing BC round B onto BD: it falls short of D, so BA + AC is longer than BC.
- Very long names shrink further to stay in the lower half of the rim.
- **Built:** Props 21–24. A slide can move one way only and leave lines and a new point where a corner lands. An angle that drops into place now moves the lock on straight away, and only stays on show for a moment (a quick next drag is no longer lost).
  - Prop 21: pull BD on to E on AC; drag the angle at A into the angle at E, then that into the angle at D: each fits inside the next (Prop 16 twice), so the angle at D is the widest.
  - Prop 22: carry the three given lines (one, two and three ticks) end to end along DE; sweep D round F and H round G until both arcs pass the same point K; join KF and KG.
  - Prop 23: tap D and E on the arms of the angle and join them; carry CD to A along AB (Prop 2); tap the faint lines to K (Prop 22): three pairs of equal sides, and the angles at C and A get one arc each.
  - Prop 24: slide triangle ABC onto D with AB along DE; C lands at G (EG = BC). Join FG (equal base angles); swing EF round E onto EG: it falls short.
- **Built:** Props 25–28. A pretend move can swing a point round a centre (*about*), so a side keeps its length; a contradiction can drop the lines and points the made-up figure needed (*drop*, *hide*), and every contradiction rattles as it snaps back. Moves are accepted while points are still sliding home.
  - Prop 25: pretend the angle at A equals the angle at D by swinging C round A; the bases would then be equal (three ticks each). Match the angle at A to the angle at D: it rattles and C swings back. Then drop the angle at D into the angle at A: it fits inside.
  - Prop 26: the two angles and the side between them are marked equal. Pretend AB is longer (drag A along the arrow); tap G where BG = DE (Prop 3); join GC; drop the angle at F onto the angle at C: it is the whole angle ACB, not GCB, so it rattles, and A slides back onto G.
  - Prop 27: the alternate angles are marked equal. Tilt FD up round F; pull AB and FD on until they meet at G; drop angle EFG, turned, into AEF: it sits inside, yet they were equal. It rattles, FD swings back and G is gone.
  - Prop 28: pull AB and CD on (they never meet); spin the angle EGB half a turn about G onto AGH, where it matches GHD: equal alternate angles, so the lines are parallel (Prop 27).
- Hall doors now work. An amber door opens its lock, a solved door leads into its hall, and Back steps back through the halls you walked through. Each door's plate shows its lock's figure, cut or uncut. Amber doors without a lock yet say so.
- Equal parts on lock plates are marked the classic way, with cut ticks and arcs, since the plates are bronze and gold only.
- **Next:** port the site's proposition engine (the `OPS` steps and short versions) so that any proposition's figure can sit on a lock plate. The engine stays the same; only the drawing and the effects change.

## 3a. Lettering, help, replay and the map (built)

- **Lettering.** Every lock plate carries its number (1.n) cut across the top like a coin, and its name along the bottom, upright and reading left to right. The figure sits inside an inner ring and never overlaps the lettering.
- **Help.** The ? button in a lock plays a pale blue ghost hand through the next move, twice. Moves that carry or swing a line show where they should land (a dashed target and an arrow), and they accept a loose drop. (Later this can cost a scroll.)
- **Continue or Start over.** With a saved game, the title screen offers Continue (straight to the doors) or Start over (tap twice to confirm; it erases progress and plays the opening).
- **Replay.** In any hall, ↺ Lock plays that hall's lock again without changing progress.
- **Map.** The Map button (at the doors and in halls) shows all 48 as stars: gold solved, glowing amber ready, grey locked, with a blue ring where you are. Tap a solved star to walk into its hall, or a ready one to open its lock. Shops will be marked here once they exist.

## 3a+. Looking around, the house plan (built 25 Nov 2026)

- **Look around:** press L and move the mouse: left and right turn, moving the mouse forward looks up and back looks down. In look mode a crosshair shows and a click acts on what is under it; Esc stops. Holding the right mouse button, or a controller's right stick, also looks. The view turns about 24° each way and 17° up and down.
- **The map is a house plan:** each room is drawn with walls and its floor (stone corridor, wooden library or bedroom, tiled kitchen, glass greenhouse), joined by walled passages with doors; locked rooms are pencil outlines. A blue circle marks where you are.
  - Since 26 Nov 2026 it draws the fixed building (world.js, section 3d), cell by cell: every cell has ink walls except where it opens into the same room or through a doorway. Corridors are stone, greenhouse junctions are glass with the blue shop statue, and lock rooms take their floor once opened. Walked doorways (gold dots) and set traps (red dashes) from section 3e show on it. The still parts are drawn once and kept (`MAPC`, `MINIC`); only glows, the shop path and "you are here" are drawn each frame. Tapping a room describes it; you walk everywhere.
- **The corner map** while you walk shows the same plan around you, with your position. Tap it (or press N) to see just this room, with its items, traps and creature.
- **Where to go next** (26 Nov 2026): on the map and the corner map, every lock you can open now pulses gold. On the corner map, a ready lock outside its window shows as a pulsing gold arrow on the edge, with its number, pointing the way (`readyArrows`).
- **Where the traps are** (26 Nov 2026): rooms that will spring a trap pulse red: those whose doorway trap is set, and the rooms next door through a doorway you have already walked today (`trapRooms`). Walked doorways stay as gold dots on the full map.
- **The clock stops** while the map is open, or the bag or the shop (`paused()`): the game clock and a lock's timer both wait.
- **The Papyrus Map** has a Use button: it shows the creatures, the unopened chests and a dotted route to the nearest shop.
- **The shop** shows each item's name, price and use when you hover over it or tap it.

## 3b. The ax and the vines (built, 24 Nov 2026)

- **Vines on every door, tougher deeper in the book** (26 Nov 2026). Every lock door is overgrown, and the vine is set by its proof: **1–12 wisteria, 13–24 Virginia creeper, 25–36 English ivy, 37–48 muscadine** (`VINEBAND` in game.html). Each has its own leaves, bark and climbing parts (twined wisteria trunks, creeper tendrils with sticky discs, ivy rootlets, grape tendrils). Some carry flowers or fruit, picked per door. Connecting rooms' doorways have no vines.
- **Only the ax (or weed killer) cuts them, on any door, at any time** (26 Nov 2026; before, only on amber doors). Each tap swings the ax, and the vine is cut back from the lock outward: leaves fall, chips fly, the vine shakes. On an amber door, the next tap after the vines are gone opens the lock. On a covered door the vines come off just the same, and the lock underneath keeps its iron cover until everything it relies on is solved (the cover, not the vines, is what holds you back). Solved doors show their vines cut back: stubs at the frame and a heap at the foot.
- **The ax** is a tool kept for good, shown in the slot at the bottom left (tap it for its card). The **Bronze Ax** leans by the front doors at the start of a new game; tapping the vines without it says where it is. It is upgraded to the **Iron Ax** after 12 solved locks and the **Starmetal Ax** after 30, until the statue shop sells them.
- **The Bronze Sword** (26 Nov 2026) leans by the left front door at the start of a game, as the Bronze Ax leans by the right one. Tapping it wields it (or puts it in the bag if you already wield something). `S.sword` remembers it was taken; Start over puts it back.
  - Blows to cut a door back with the Bronze Ax: wisteria 6, Virginia creeper 10, English ivy 15, muscadine 20. The Iron Ax takes 0.6 as many (4, 6, 9, 12) and the Starmetal Ax 0.3 (2, 3, 5, 6), rounded, never fewer than one (`axStrikes`). The ax card lists the blows for each vine with the ax you carry.
  - **Every tap is a blow** (26 Nov 2026): the blow lands the moment you press, and the swing lasts only as long as the press. Holding keeps the bit in the vines; letting go bounces it off in 0.14 s. A new tap during a swing starts a new blow at once, so a door comes clear as fast as you can tap (6 taps for wisteria). A weed killer still clears its share in one pour.
  - The ax is drawn broad (26 Nov 2026): the head is 1.15× longer and 1.45× taller than before, and the haft 1.25× thicker (`HEAD_X`, `HEAD_Y`, `HAFT_W` in tools.js).
- **Swing.** First person: the hands are just below the screen, the ax comes over from behind and its bit lands on the tapped spot, then bounces off. On a computer the pointer becomes the ax over vines it can cut.
- **Map.** Ready rooms still covered in vines carry a leaf; tapping one walks you to the hall (or the front doors) where that door is.
- **Save.** `S.ax` (0 none, 1–3 the tier) and `S.vd` (each door's damage, 0–1). Saved games with progress get the Bronze Ax (and any upgrade they have earned) on load. Start over clears both.
- **Art.** `vines.js`, `tools.js` and `core.js` are copied from Art-Assets (research: `research/subjects/plants/` and `research/objects/tools/`). Each door's vine is drawn once per damage step and kept; hall doors map it onto the wall in strips, like the paintings.

## 3c. Room types, walked in the corridor's view (built, 25 Nov 2026)

- **Every hall is a room of one type**, chosen at random the first time you walk into it after solving its lock, and kept in the save (`S.rooms`). Types now: **corridor** (stone, paintings, windows), **greenhouse** (glass walls and roof with glazing bars, grass floor, a flagstone path down the middle, dirt beds of plants along both walls, grass tufts) and **library** (panelled walls lined with bookshelves, a painting every third bay, wall-to-wall red carpet with a runner, armchairs with side tables and lit lamps). Bedroom, pantry, bathroom and kitchen can follow as more types in `ROOMTYPES` / `ROOMLOOK`.
- **One view and one set of mechanics for every room:** the corridor's perspective, doors, locks, vines, statues and lights. Rooms differ in surfaces (`roomSurfaces`) and furnishings (`roomThings`).
- **Walking:** WASD or the arrow keys, a controller (left stick or d-pad), or tap the floor where you want to go. You walk down the room and from side to side; doors and paintings still respond to taps from wherever you stand. Entering a room starts you at its entrance.
- Glass doors lead straight into the neighbouring room again. (The top-down garden walk from 24 Nov, `enterGreen`, is no longer reached from the halls.)
- Art: `furniture.js` (bookshelf, armchair, side table) and `plants.js` from Art-Assets.
- **Bedroom** (built, 25 Nov 2026): a square room (about 4.4–6 m across). Its floor is always indoor (stone or wood) with a carpet. It always has one bed, or two side by side against the far wall (a bunk bed counts as one), chosen from canopy, tree of life, art deco, four-post, bunk and Japanese futon. A nightstand with drawers stands by the bed (two beds share the one between them, and the second gets its own); on it a nightlight: a cylinder, a sphere or a jar of fireflies. It may have a mobile over the bed (propeller planes, woodland creatures or space), a bookcase, an armchair and the hall's statues. Lighting comes from the hall's light style plus the nightlights. Beds and nightstands are the places to hide coins and items later.
- **Room sizes:** rooms differ in width (corridor 2.6–3.6 m, greenhouse 3–4.6 m, library 3.2–4.8 m) and bedrooms are square. The hall layout (lights, paintings, statues) is designed on a 3 m × 13 m corridor and stretched to each room's size. Doors are not part of that layout: they come from the plan (section 3d).
- **Indoor floors:** every room except the greenhouse has a stone or wood floor from `floors.js` (corridor stone, library wood, bedroom either), drawn row by row so it stays true in perspective, with a carpet: a runner in corridors that have one, a large carpet in the library, a rug in every bedroom.
- Art: `floors.js` and `bedroom.js` from Art-Assets.

## 3d. One fixed building (built 26 Nov 2026)

> The plan described here (lock rooms in bands, routes for every dependency, greenhouse junctions with gardens) was **replaced on 27 Nov 2026** by the house in section 3f. Speed notes below still hold.

- **Map first.** The whole tomb is one floor plan, the same for every player: `world.js`, made by `tools/make-world.py` (run it again only to change the building; its `SEED` and layout numbers are at the top). The plan is a grid of 3 m cells.
- **Lock rooms** (1–48) are halls three cells long. The book's depths run in bands that snake left to right, right to left, then left to right again, so the plan is about square.
- **Connecting rooms** (ids 100 and up) hold no lock. Every dependency is a walkable route from one lock room to the next. Routes share corridors, and where corridors cross they meet in a junction, so the building fits on one floor without stairs. Junctions where three or more ways meet are **greenhouses**. Each greenhouse's far wall is the gate to its garden, whose size is fixed in the plan (`GARDEN.plan(seed,{w,h})`).
- **Doors.** A room's doors are its doorways in the plan. A lock room whose proofs are not all solved keeps its plate covered. You can walk up to its door, but not open it.
- **Rooms match the map** (26 Nov 2026). You look down a room along its length, facing away from the door you came in by (in a one-cell junction, straight on; by a side door, down the longer part of the room). Each doorway is where the plan puts it: on your left or right at its distance down the room, or on the far wall (beside the lock's figure or the garden gate when the wall has one). A door on the wall behind you shows when you **turn round** (T, or the Turn round button). On the map, the blue dot has an arrow pointing the way you face. This replaces the old rule that alternated doors left and right with a random mirror so rooms would not look the same: with a fixed building, the rooms must match the map so the Euler walk is fair.
- **Corridors taken out by hand** (26 Nov 2026): the 9-cell corridor straight down from 4 to 21 is gone; players looped between them without finding the next lock. `REMOVE` in tools/make-world.py drops it after the rooms are numbered, so no other room changes, and the script checks that every proof is still reachable once what it relies on is solved. 48's dead-end corridor grew by 5 cells so 48 stays the farthest room (85 cells' walk; 40 is next at 81).
- **48 is the last room:** a dead end past the far corner of the last band, with one door. It is the farthest room from the entrance (80 cells' walk; the next farthest, 45, is 74). It opens only when all 47 other proofs are solved.
- **The forecourt** (room 100) joins the two front doors (1 and 4). Its far door leads back out to them.
- **Map screen.** It draws the floor plan. Tapping a room tells you about it; you walk everywhere (see 3e).
- **Rooms are fixed.** Every room's type comes from the plan. Its size, plants, items, traps and creature are grown from its number, so they are the same on every visit. A connecting room's creatures and loot follow the earliest proof whose route runs through it (`lvl`). Saved games keep their progress, but room types now come from the plan (`S.rooms` is no longer used).
- **Speed** (26 Nov 2026):
  - The room's walls, floor, ceiling and far wall are drawn once per view and kept. While you walk they are redrawn at lower resolution, and sharp again the moment you stop.
  - Plants and floor items are pictures. Each plant has one picture per stage (seedling, young, past, dormant, dead) and three for mature; a potato's three are its skins, so what you see is what you dig up. Each picture is drawn once, large, and smaller sizes are scaled down from it.
  - Paintings, vines and shelves only draw their own slice of the picture per strip.
  - Wall paintings: each picture is drawn once and kept, then halved down (large to small); a painting on the wall uses the kept size nearest its size on screen.
  - Glows (torches, lamps, doors, the hand, sparks) are one soft dot per colour, drawn once and reused, instead of a new gradient for every glow.
  - The floor is clipped to its own outline, so its taller near strips keep straight edges.
  - The map's plan is drawn once per change in progress.
  - Measured in headless Chrome at 2× (1280×800): a standing frame went from 40–143 ms to 10–30 ms, walking to 27–46 ms, and the map from 41 ms to under 1 ms.
- **Copy back to Art-Assets:** `garden.js` gained the optional `{w,h}` size in `GARDEN.plan`, and `items.js` gained a shield drawing and the Ghost Draught's pale blue.

## 3f. The house, Scholar and Dungeon Crawler, and the menu (built 27 Nov 2026)

### The house (world.js v2, `tools/make-world.py`)
- **The house comes first; the locks are put in its rooms.** The plan is no longer drawn from what relies on what. It is a house of rectangular rooms on the 3 m grid, each a corridor, library, bedroom, kitchen or greenhouse, each with its own width and depth (corridors 1 cell wide and 2 to 5 long, libraries up to 3 × 4, bedrooms square, and so on).
- **Greenhouses are just another type of room.** They join nothing special and have no garden gate (the garden scene is no longer reached). Each still has the blue statue shop and the campfire in Dungeon Crawler.
- **The front.** Locks 1 and 4 are the temple's front doors. Behind them are rooms 1 and 4, and both open into the entrance hall (room 100), so the whole house is open once either front door is.
- **Where the locks are.** Every other proof n is a locked door in the wall of a connecting room (its *host*, `hosts` in world.js), leading into a room of its own (room n) that shows its finished figure. The house is grown outwards from the entrance hall, breadth first, and the locks are handed out in the book's order as it grows, so the book runs outward from the front doors. **A room can hold several locks** (e.g. the entrance hall holds 2 and 3). Some lock rooms have a second door, a shortcut into the next room, which opens with the same lock. 48 is a dead end off the room farthest from the front doors.
- **Loops.** About a third of the pairs of connecting rooms that touch get a doorway, so the house has loops for the Euler walk.
- The script checks that each proof's door can be reached as soon as everything it relies on is solved, and that 48 is the farthest lock (47 cells' walk; then 44, 45, 47 at 45).
- world.js v2 lists every doorway with the cell it leaves from and the way it faces (`doors["a>b"]`); 0 is outside.

### Rooms match the map
- **Doors where the map has them.** Each doorway is on the left or right wall at its distance down the room, or on the far wall at its place across it (several far-wall doors stand side by side; the room's figure moves out of their way).
- **The fourth wall.** You come into a room facing straight away from the door you came in by. That door is behind you, in the screen, and is not drawn; turn round (T) to see it, or use Back. (Walking backwards into the screen does not take you through it: the user asked for that to be left out on 27 Nov 2026, because once you have turned round the door is no longer behind you.)
- **Sizes from the plan.** A room's depth is 3.5 m per cell down the way you face (plus 0.8 m) and its width 2.2 m per cell across (plus 0.8 m), so rooms are as wide and as deep as the map draws them (`roomGeo`). Things placed in a room (items, plates, the Euler path) are laid out for the way you face (`RITEMS`, `PLATES`, `PATHS` are kept per axis); a creature is kept inside the walls.
- **Doors you can tell apart.** Each door looks like the room it leads to: a square stone door to a corridor, a round dark-wood arch to a library, a low cream door to a bedroom, a broad copper arch with black and white tiles to a kitchen, a pointed glass arch to a greenhouse, and a sign over it with the room's mark (and the lock's number for a lock room). Through an open door you see a glimpse of that room's colour.
- **Floors by the book's depth.** Rooms holding proofs 1–12 have sandstone floors, 13–24 aventurine (green, glittering), 25–36 marble (white, veined), 37–48 Salamanca golden sandstone. A connecting room takes its earliest lock; one with none takes the part of the book the house was growing at. **Kitchens are always black and white linoleum.** Greenhouse paths are cut from the band's stone.

### Scholar and Dungeon Crawler
- **New game** on the title screen offers **Scholar** or **Dungeon Crawler** (over a saved game, tap twice to erase it). **Settings** switches between them at any time (`S.mode`; old saves play as Dungeon Crawler).
- **Scholar:** only the locks and the rooms between them. No vines, traps, health bar, cooking, harvesting, items, chests, creatures, shop, ledges, Euler walk or lock timers. On the map, tap a lock you can open (or a room holding one) to go straight there and open it, or a solved one to go into its room.
- **Dungeon Crawler:** everything, as before. A new game starts with the **Bronze Ax, the Iron Cauldron and the Bronze Sword** in the inventory (`startKit`, given once, `S.kit`), so the ax and sword no longer lean by the front doors.
- **No traps in the rooms of the first four proofs:** rooms 1–4, the entrance hall, and any room whose walls hold lock 1, 2, 3 or 4 (`noTraps`).

### Locks always show, fixed rooms, armchairs (27 Nov 2026, second round)
- **Locks always show.** Dungeon Crawler is Scholar plus the extras: the same proposition locks, with vines, traps and creatures added. The vines grow *round* a lock, never over it: the plate is drawn on top of them on the front doors and on room doors, so every proposition shows; you still cut the vines before you can open it. Every plate sits in the middle of its door (far-wall doors used to put it on the door's edge) and is bigger. An unsolved plate shows its number (1.n) over a faint ghost of its figure. Coming into a room whose walls hold a lock you can open now, a note says which lock and where it is (ahead, on your left or right, or behind you).
- **Rooms are fixed.** Every cell is 3.3 m square, so a room keeps its size whichever way you face. Everything in a room has one place in it, worked out once from the room's number (in its canonical view, looking east or south down its length) and kept: lights, pictures, shelves, windows, statues and the shop, planters, greenhouse beds, path and plants, armchairs and tables, beds, nightstands and mobiles, the stove, island and campfire, the floor and its rug, items, chests, traps, the Euler path and the creature. Turn round or come in by another door and they are where they were. A picture or light on the wall ahead is drawn flat on the far wall; one behind you is out of sight. Things closer than 0.9 m (you are standing in them) are not drawn.
- **Permanent places: decided yes.** The places are worked out once per room per game session and kept in memory (not in the save: they come from the room's number, so they are the same in every game). This is also less work than before, when the decor was laid out again every frame.
- **Looking around moves the whole room.** The room's walls, floor and ceiling are kept as one picture per view; that picture now also depends on where looking has moved the vanishing point, so walls and floor move with the furniture when you look around (right mouse button, L, or the right stick). While the view moves it is redrawn at lower resolution, then sharp again.
- **Armchairs** (libraries, some bedrooms) each hold 1 to 5 coins down the side of the cushion (fixed per chair). Not yet searched, a book lies open on the arm; tap the chair (or E beside it) to search it, and the book moves to the cushion (`S.chairs`). Scholar: no coins; the book stays on the arm.

### HUD, menu and the marker
- **The HUD** is the minimap, the health bar (Dungeon Crawler) and the compass heading. The clock, firewood and weapon moved to the Inventory tab; the keys to Settings.
- **The minimap** shows this room and the rooms next to it, turned so the way you face is up. Doors are gaps in the walls: gold open, amber ready, grey covered. N (or a tap) still switches to this room from above.
- **The menu** (☰ Menu, M, or Bag / I for Inventory) has four tabs: **Inventory, Map, Solved Puzzles, Settings**. The clock stops while it is open.
- **Lock doors look like the front doors** (27 Nov 2026): a carved wooden leaf with a brass frame and iron bands, and a big bronze plate with the proposition's starting figure; the sign above says "1.n". Covered locks have the iron cover over the plate; in Dungeon Crawler vines grow round it. An open (dark) doorway means that room is unlocked.
- **The way to the next puzzle** (27 Nov 2026). With no marker set, the guide leads to the nearest lock you can open now: the door to take glows amber with a beacon and pulses on the minimap. Ready plates glow, with a gold ring; covered plates have the iron cover.
- **Markers.** Tap a room on the map to put a marker on it (tap again to take it away). The way there runs through the rooms you can walk now; the door to go through next is lit amber with a beacon in the room, and pulses amber on the minimap. If it is behind you, the minimap says to turn round. Reaching the room clears the marker (`S.marker`, `GUIDE`).
- **Solved Puzzles** shows every solved proof as its finished figure (the thumbnails); tap one to watch it solved for you: the site's own lock view (`index.html?lock=N`) plays "Solve it for me" (index.html now hears `"solve"`), with Step and Solve again.
- **Settings:** the way to play; the keyboard (change any action's key: press Change, then the key; Reset the keys; saved in `S.keymap`); the mouse (look speed, invert up and down); the music (on/off, song, volume).

## 3e. The building's Euler puzzle (built 26 Nov 2026)

- **Walk each doorway once a day.** Every doorway you walk through is marked for the game day (`S.walk`), including the front doors and the Back button.
- **Walking back sets a trap.** Walk back through a doorway you have already walked today, and the room you step into sets its doorway trap (`S.arm`). The trap is a strip of pressure plates across the floor, just inside the entrance and before the room's doors. It fires spikes from the floor or flame jets from the walls (fixed per room), for 15 health.
- **Using a far door.** Tapping a door beyond a set strip walks you across it, so you can't skip it by tapping from afar. Back works the same way.
- **Ways past:**
  - walk along the room's ledge, which runs beside the strip;
  - jump the strip (spikes only);
  - set an item down on it: the trap springs on the item, the item is lost, and the trap is spent;
  - carry a **Bronze Shield** (statue shop, 25 coins; takes three blows, then splits);
  - wear a cape (takes one blow a day);
  - drink a **Ghost Draught** (statue shop, 20 coins): for an hour of game time no trap can touch you, and the view takes a pale blue tint.
- **Ledges.** Every room now has one ledge: 0.6 m high, along a wall just inside the entrance, on the side with no door there. It replaces the old random ledges (0.6 or 1.2 m, about one room in three). Stepping down from 1.2 m costs 13 health, nearly as much as the trap, so a high ledge would not be a real way past.
- **At dawn** every doorway counts as unwalked again and every trap disarms.
- **The map only shows.** There is no jumping between rooms, so every doorway you use is walked. It marks today's walked doorways with gold dots and set traps with red dashes, and tapping a room tells you about it. A set strip also shows red on the minimap.

## 4. Treasure, coins and the statue shop

- **Chests** are hidden in halls and greenhouses. Opening one gives 1–20 coins, weighted by the hall's proposition number *n* (`coinRoll(n)` in the code). The weights follow a bell curve centred at 1 + 19·(n−1)/47, with a spread of 1.6:
  - in hall 1, about 3 chests in 4 give 1–2 coins;
  - in hall 47, nearly 9 in 10 give 18–20.
- **Statue shop.** One statue stands in every greenhouse. It glows blue, not gold, and sparkles as you pass. Sell items to it for coins, and buy scrolls with coins.
- **Scrolls** are single-use guides. Inside a lock, a scroll makes the light run ahead of your hand through each step, so you can follow it. This reuses the site's Solve/Step hand.
- **Clothes** dress your character: necklace, sword, boots, cape, gloves, crown. Most are ornamental; boots speed walking, and charm necklaces give fire or poison immunity or heal over time. Fire is the wall flames and flame traps; poison is the fog traps.

### The items (all in `ITEMS` in the code)

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
| 11 | Scholar's Sandals | boots | 8 | Strapped sandals: walk ×1.25. Found once, in hall 3. |
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
| 31 | Bronze Ax | tool | — | Cuts back the vines on a door you may open, in ten strikes. Found by the front doors; never sold. |
| 32 | Iron Ax | tool | 30 | A forged iron head on hickory: six strikes. |
| 33 | Starmetal Ax | tool | 60 | Forged from a fallen star: three strikes. |
| 34 | Wayfarer's Boots | boots | 30 | Laced hunting boots: walk ×1.5. Found once, in hall 15, after the sandals. |
| 35 | Winged Sandals | boots | 70 | Hermes' sandals: walk ×1.8. Found once, in hall 30, after the boots. |
| 36 | Linen Chiton | shirt | 8 | A plain linen tunic with a blue border. |
| 37 | Wool Trousers | pants | 8 | Warm, scratchy and good for long corridors. |
| 38 | Weed Killer (weak) | potion | 6 | Withers 4/10 of a door's vines. Kills a plant. One use. |
| 39 | Weed Killer (strong) | potion | 14 | Withers 7/10 of a door's vines. Kills a plant. One use. |
| 40 | Weed Killer (strongest) | potion | 28 | Withers all of a door's vines. Kills a plant. One use. |
| 41 | Chest | container | 12 | Once emptied, carry it and set it down in any room. |
| 42 | Health Potion | potion | 10 | Rose-pink, bronze caduceus stopper. Drink: +25 health. |
| 43 | Greater Health Potion | potion | 22 | Red, silver caduceus. Drink: +50 health. |
| 44 | Supreme Health Potion | potion | 45 | Deep crimson, glowing, gold caduceus. Drink: full health. Rare in rooms. |
| 45 | Rucksack | pack | 40 | The bag holds 24. Bought once at the statue; not a bag item. |
| 46 | Expedition Pack | pack | 90 | The bag holds 32. Sold once you have the Rucksack. |
| 47 | Ember Charm | necklace | 15 | One lick of flame on a bronze chain. Fire immunity 30%. Shop. |
| 48 | Twin Flame Pendant | necklace | 35 | Two licks of flame, silver chain. Fire immunity 60%. |
| 49 | Triple Flame Amulet | necklace | 80 | Three licks of flame, gold chain. Fire immunity 98%. Rare. |
| 50 | Antidote Drop | necklace | 15 | A green drop with a skull and crossbones. Poison immunity 30%. Shop. |
| 51 | Heart of Antidote | necklace | 35 | Two green drops making a heart. Poison immunity 60%. |
| 52 | Tulip of Antidote | necklace | 80 | Three green drops making a tulip. Poison immunity 98%. Rare. |
| 53 | Gentle Caduceus | necklace | 20 | Bronze caduceus. Heals 1 health a minute while worn. Shop. |
| 54 | Effective Caduceus | necklace | 45 | Silver caduceus. Heals 3 health a minute. |
| 55 | Reckless Caduceus | necklace | 90 | Gold caduceus. Heals 10 health a minute. Rare. |

### Built (25 Nov 2026): items in rooms, the bag, the wardrobe, the shop, weed killer
- **Rooms:** every room holds 1–3 items, picked per room type (`KINDROOMS`, `ITEMROOMS`; 0 keeps a kind out, e.g. no scrolls in greenhouses, no tools anywhere). About one room in three has a chest: coins (`coinRoll`) plus one random item. An empty chest is an item: carry it, place it in another room.
- **The bag** (Bag button, bottom left): 16 slots; coins are a count. Tap an item for its card: Use / Pour, Wear, Drop. Dropped items stay where you set them (`S.drops`).
- **Boots:** the three speed boots never appear at random. Each is found once, tucked behind the far statue in hall 3, 15, 30, and only after you have the one before (found or bought). Worn boots multiply walking speed in halls and greenhouses.
- **The wardrobe:** eight carved hollows above the bag (hat, necklace, cape, shirt, gloves, rings, trousers, boots; the necklace hollow sits under the hat and above the shirt), the locks' gem-and-hollow idea. Drag clothes into the hollow they fit (it glows), drag them out to take them off. Worn clothes don't use bag space.
- **The statue shop:** one statue in each greenhouse room glows blue. It sells scrolls and the boots you don't have, buys anything (except tools) at half price, and sells back what you sold it, at full price.
- **Greenhouse harvest** (25 Nov 2026): about one greenhouse plant in four is still growing when first seen and is ready once you solve another lock. Tap a ready plant to harvest it: its fruit, root, flower or leaf (`PLANTS.harvest`) goes in the bag (anything that doesn't fit is left on the floor) and the plant is gone (`S.picked`). Houseplants give nothing. Potatoes grow in about half the greenhouses.
- **Potatoes:** a ready potato shows a third of each tuber above the soil and gives 3 raw potatoes (red, purple or brown by plant). Pour a **Sack of Soil** (greenhouse rooms, or the statue shop) on a growing potato to earth it up: up to 3 times, each adding 2 potatoes (5, 7, 9). Raw potatoes must be cooked (Bag → Cook, in any room) into a Baked Potato before they can be eaten. Other produce is eaten as it is.
- **Health potions** (25 Nov 2026): red potions with a caduceus stopper in three strengths (+25, +50, full). They turn up in rooms now and then (the Supreme one rarely) and the statue shop always sells all three. Bag → Drink. You can't drink one at full health.
- **Ripe crops show:** a ripe plant's crop floats over it in a gold ring, so you can see what is ready to harvest from across the room. Food that is eaten as it is (raspberries, strawberries, apples…) gives health; its card says how much.
- **Kitchens are stocked:** every kitchen has 3–5 Ingredients on its table or island, usually all of one recipe, so there is always something to cook at the oven.
- **Backpacks:** the bag starts as a 16-slot satchel. The statue sells the Rucksack (24, 40 coins), then the Expedition Pack (32, 90 coins). Buying one swaps it in.
- **Shops on the map:** every greenhouse room you have found shows a small blue statue on the map.
- **Weed killer** (Potion category, single use): Pour from the bag, then tap a door's vines (they wither by 0.4, 0.7 or all, the same cuts in work as the Iron and Starmetal Axes) or a greenhouse plant (it dies, `S.dead`). Tap anywhere else to put it away.

Proposed rules (open to change):
- The statue buys items at half price and sells scrolls at full price.
- Deeper halls drop rarer items.
- The Iron and Starmetal Axes come by milestone for now (12 and 30 solved locks); once the shop exists they can be bought instead.

## 4b. Game systems (built 25 Nov 2026)

The rules and numbers live in **engine.js** (Art Assets; see its "Game engine" tab, which runs each part live and has an Edit button that opens a prefilled Request Builder ticket). game.html applies them. Change a number in engine.js and copy the file here.

- **Time:** a game clock, 1 real second = 1 game minute (a day is 24 minutes), shown top right with ☀/☾. Growing greenhouse plants are ready 6 game hours after you first see them (this replaced "ready after your next lock").
- **Health:** 100, shown as a bar top right. Lost to creatures, traps, falls and timed-out locks; regained from food (raw food +4, cooked +12, baked potato +14, dishes 24–42) and 2 an hour over time. At 0 you faint and wake at the front doors with 50, a tenth of your coins dropped.
- **Keys:** M map, I / B / Tab bag, WASD / arrows walk, Space jump, C climb, F attack, E use (pick up, open, cook, talk), Esc close or back, H / ? the list of keys (also the ? button by the clock). Controller sticks still walk.
- **Minimap:** the room from above in the corner: doors (gold when open), items, ledge, traps, the creature (red hostile, green friendly), the campfire or stove, and you with your view.
- **Lock timers:** every unsolved lock is timed (2 minutes plus 25 seconds a proof step; the bar is at the top). Run out and the lock snaps shut (−10 health) and seals for 90 game minutes; it says how long when you try it.
- **Ledges:** about one corridor, library or bedroom in three has a stone ledge along a wall, 0.6 m (jump onto it with Space) or 1.2 m (climb with C), usually with one of the room's items on top (out of reach from the floor). Stepping off a 1.2 m ledge costs 13 health.
- **Traps:** pressure plates (faint slabs; spikes spring up, −12; jump over them). Path rooms (from hall 5, about one in six): bronze studs and lines on the floor; walk every line once without going back over one (an Euler trail). Backtracking fires the room's trap (flame throwers in the walls, spikes or poison fog, −15); finishing pays coins from a hidden drawer.
- **Combat:** from hall 3, about one room in five holds a creature (harpy from hall 3, basilisk 8, minotaur 14, manticore 20, hydra 28). About a third are friendly until struck (E to look at them). Hostile ones close in and bite on a timer. Wield a knife, sword or staff (Bag → Wield; bronze, iron or starmetal; bought at the statue) and press F or tap the creature; fists do 2. Weapons wear out (perfect, damaged, broken) and can be put away again. A slain creature drops coins.
- **Cooking:** ingredients (food that must be cooked: raw potatoes, eggplant, beans, winter squash, rhubarb, asparagus, sunflower seeds, lavender) can't be eaten raw. Cook them in a **kitchen** oven (a new room type: a cast-iron range always, and a table or an island) or in a **cauldron over the campfire** that burns in every greenhouse (buy the cauldron at the statue; each dish takes 2 firewood). Only dishes with at least one ingredient can be cooked. Cooking is a timing check per ingredient (stop the marker in the lit range: one wide range for a baked potato; three or four narrow ones for Potato Soup, Bean Stew or Ratatouille). Miss and you get a Burnt Lump.
- **Fuel:** every strike on vines gives 1 kindling; 5 kindling count as 1 firewood. Fruit trees in greenhouses give fruit (again a day later), and with the ax they can be cut down for 3 firewood. The statue sells firewood.
- **Shop:** now also sells the nine weapons, the cauldron and firewood.

## 5. Sound

- **Music:** ten songs in a dungeon-crawl style, but bright (adventure, curiosity, fun). Drums lead (kick, snare backbeat, hats, fills on every song); the lead line is kept soft. They are composed in code from a seed: a melody, bass, pad, arpeggio and drums, with an echo like a stone room. Each song plays twice, then the next one starts.
  - Songs: The First Postulate, Lantern Corridor, Compass and Ivy, Gnomon's March, The Greenhouse Fountain, Parallel Halls, The Gilded Theorem, Stairs of Alexandria, Byrne's Colours, Q.E.D.
  - The bottom-right corner always has: on/off, a song list, next song, and a volume slider.
- **Playback (26 Nov 2026):** each song is rendered once into a sound buffer (`OfflineAudioContext`, mono) and looped, so playing it makes almost no new audio nodes. A song plays note by note until its buffer is ready, then switches over at the top of a loop. The next song is rendered while this one plays; only those two are kept (about 7 MB each). The room echo is still added live.
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
2. **Locks for all 48:** Props 1–28 are done, and walking between halls works. Next: 29–32.
3. **Greenhouses:** junctions, fountains with water sound, the blue statue shop, chests and coins, and an inventory and character screen with clothes.
4. **Scrolls** (guided mode), more art variety for halls (different statues, paintings showing each hall's own figure), and phone testing across all 48.

## 7. Art note

All art is drawn in code (canvas): stars, the solar system, the temple, stone walls, ivy, bronze plates, wooden doors, and halls in perspective. This keeps the game to one small file and sharp at any screen size, but the style is clean and illustrated rather than painted. If painted art is wanted later, each scene has a single drawing function that an image could replace.

**House style (25 Nov 2026):** accurate proportions with back-lit silhouette lighting. Creatures are dark shapes lit from behind, with a cool rim on their outer edge, hair breaking the edge and glowing eyes (amber calm, red-orange angry). Their bodies come from the engine's skeleton (`ENGINE.skeleton`), so a creature's proportions stay the same whatever the paint. The creatures are done; rooms, plants, items and locks follow. Rules: Art-Assets `research/rendering/house-style.md`.

Built (23 Nov 2026), from the feedback list:
- Every hall has its own look, the same on each visit (seeded by its number). It sets the wall and floor colours, which wall the doors start on, and whether there is a rug and night windows. It also picks the lighting: torches, sconces, candelabras, floor lamps or a Tiffany lamp on a side table.
- Two great minds stand in each hall, as busts or full figures in marble or bronze. Tap one to read its plaque: name, dates, a saying with its source, and its greatest work. Thirteen people so far, from Euclid to Emmy Noether. Each quote was checked against a source, and Eratosthenes and Hypatia say "None of his/her sayings survive" rather than carry a made-up quote.
- Double-tap a painting, or the figure on the far wall, to see its blueprint: the finished figure in white on blue, its number, and the step list in a title block at the bottom right.
- Equal marks shine in their own colours as they are cut (one tick cyan, two rose, three green, four violet), not gold.
- The map is a building plan. Rooms are squares and corridors turn square corners. Greenhouses join rooms that sit next to each other in one column. Once both rooms are solved, the greenhouse shows as a glass door in each hall, so you can cross between branches without walking back.
- Matching two equal lines in a lock: touch an end to an end, and the line swivels on and is pulled into place.

Built (23 Nov 2026): one source for every proof. Every lock except the two front doors (1.1 and 1.4) now shows the Home page's own proof on the bronze plate. The Home page opens in embed mode (`index.html?lock=N`), which shows only the figure, in bronze colours on a clear background. It tells the game what to say in the caption and when the proof is won, and the game's ? button asks it for one step. So every change to a Home proof reaches the game at once, and locks 29–48 are open too. Plates, paintings and blueprints use Home's finished figures (thumbs.js), and blueprint step lists come from proofs.js. The game's own copies of Props 2–28 (FIGS) are gone.

Built (23 Nov 2026): bridge greenhouses. In the farthest solved room of a branch (none of its next rooms solved yet), a proof it opens may still wait on one from another branch. That room then gets a glass greenhouse door straight to the nearest lock you can open on the way to the missing proof, found by following what it relies on back to a ready lock. On the map these show as curved glass passages, and they change as you solve.

Built (23 Nov 2026): greenhouse plants. `plants.js` brings over the plant symbols from the Planting Guide repo: its drawPlant code and the 50 plants (name, silhouette, colours, mature size). The art is reworked to look more lifelike:
- pointed leaves with light and shaded halves, a midrib and side veins
- rounded masses lit from the upper left, and big foliage dappled with small leaves
- glints on fruit and berries
- tapered bark trunks with furrows
- shaded terracotta pots
- a soft shadow on the ground

Each greenhouse gets 3–4 plants picked at random once per game. They grow behind the glass doors, in planters either side of each glass door, and as tiny plants in the map's glasshouses.

Built (24 Nov 2026): greenhouse rooms and gardens.
- **Walking in.** A glass door in a hall now opens the greenhouse itself rather than jumping straight to the next hall. Inside are planters with that greenhouse's plants, a working fountain, the blue statue shop, the far door (with its lock plate while the proof behind it is unsolved) and a garden gate in the right-hand wall. Back returns to the hall you came from.
- **Statue shop.** Tap the statue to buy and sell. Your coins show as a chip at the top of greenhouse and garden screens.
- **Gardens.** Each greenhouse has its own walled garden, generated once from the greenhouse's key (`garden.js`, shared with the art-assets repo). Sizes run from 8 to 50 cells wide and 16 to 50 tall. The theme is herb, vegetable, fruit, flower or mixed. The layout has a path ring, a spine path, cross paths every 7–8 rows, beds planted at each plant's real spread, trellises for climbers, lanterns where paths cross, benches, tools, and a fountain on a paved square. Drag to look around; scroll or pinch to zoom.
- **Locks in the garden.** One to three pedestals hold locks you can open now, picked from the ready locks nearest the greenhouse. Solving one returns you to the garden.
- **Treasure.** Every garden hides one chest (coins from `coinRoll`) or one item. It can be taken once and is remembered in the save.
