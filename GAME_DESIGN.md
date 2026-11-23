# Elemental Geometry: the Game (design)

The site's 48 propositions become a tomb you explore. Each proposition is a lock. You open a lock by building its figure, and the opened door leads to the propositions that depend on it. The interactive part follows the site's rule: almost no words, and you learn by doing.

File: `game.html` (one self-contained page, linked from the site's **Game** button). Everything is drawn and composed in code, so there are no image or sound files to host.

## 1. Opening scene (built)

Skippable at any moment with any key, click or tap.

1. Many stars fade in. 48 of them are the propositions, laid out exactly as on the relationship map.
2. The lines of the map draw themselves between those 48 stars. The other stars fade away.
3. The camera zooms towards 45 (no labels), then swerves to 1. Text appears at the bottom in four parts: "When things are too big, too complex to be understood," / "we make connections, we simplify," / "we go back…" / "to the beginning."
4. Star 1 swells into a sun. The view resolves into a solar system and zooms in on the Earth.
5. A ruined temple at dusk. The camera sweeps up the great stairs to a pair of massive doors. The left lock glows amber.

## 2. The building model (how the map becomes architecture)

- **Halls.** Every proposition *n* is a hall (a long corridor with statues, paintings and torches). You enter hall *n* by opening lock *n*.
- **Doors in a hall.** Hall *n* has one door for each proposition that relies on *n* (its children on the map). For example, hall 1 has doors to 2, 9, 10 and 11.
- **Door states.**
  - *Open*: that proposition is solved.
  - *Amber*: every proposition it relies on is solved, so it is a valid next step. Several doors can be amber at once.
  - *Covered*: something it relies on is unsolved. The lock stays visible, but an iron cover sits over it.
- **Greenhouses (junctions).** A proposition that relies on two or more others is reached through a greenhouse: a lush, abandoned glasshouse with ivy and fountains, some of them still working. Every parent hall opens into the same greenhouse. Inside, the child's door is covered until all its parents are solved, and paths lead back to each parent hall. If you walk towards the covered door you see what you still need. If you walk the other way you reach the missing proposition's hall.
  - Example: 5 relies on 3 and 4. Halls 3 and 4 both lead into the "5" greenhouse. If 4 is unsolved, the path out of the greenhouse leads back to the front doors.
- **Front doors.** 1 and 4 rely on nothing, so they are the two front doors. 1 opens the left door. 4 opens the right door, which is boarded up for now as new territory.
- Hall 1's doors come from the map: 2, 9, 10 and 11. (The brief mentioned "1.2 and 1.5", but 5 relies on 3 and 4, not on 1, so 5 is reached through the 3/4 greenhouse.)

## 3. Locks and the magic

- Each lock plate is a bronze disc carrying the proposition's starting figure: the "Let…" sentence, with no letters shown.
- At the point of touch, a gold light follows the finger. Only the moving point glows, never the whole line. It leaves a shooting-star trail that fades.
- Behind the light, the figure is cut into the bronze as a groove. The groove shines brightly when cut, then fades to a plain carved line that stays.
- When the figure is complete, the shape glows gold. Then come the sounds of tumbling locks, the bolt, creaking hinges and the door settling.
- **Built:** Prop 1. Sweep B round A and A round B; once the arcs pass the crossing point, the light finishes each circle by itself. The crossing point sparkles. Then join A and B to it.
- **Next:** port the site's proposition engine (the `OPS` steps and short versions) so that any proposition's figure can sit on a lock plate. The engine stays the same; only the drawing and the effects change.

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

- **Music:** ten songs in a dungeon-crawl style, but bright (adventure, curiosity, fun). They are composed in code from a seed: a melody, bass, pad, arpeggio and drums, with an echo like a stone room. Each song plays twice, then the next one starts.
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
   - the ten songs and the volume control;
   - the item data and the coin roll;
   - the progress save.
2. **Locks for all 48:** move the site's engine into the lock plates, then build the Prop 4 lock (the slide puzzle) for the right front door. Moving between halls.
3. **Greenhouses:** junctions, fountains with water sound, the blue statue shop, chests and coins, and an inventory and character screen with clothes.
4. **Scrolls** (guided mode), more art variety for halls (different statues, paintings showing each hall's own figure), and phone testing across all 48.

## 7. Art note

All art is drawn in code (canvas): stars, the solar system, the temple, stone walls, ivy, bronze plates, wooden doors, and halls in perspective. This keeps the game to one small file and sharp at any screen size, but the style is clean and illustrated rather than painted. If painted art is wanted later, each scene has a single drawing function that an image could replace.
