# Drawing plants the way they grow

`plants.js` draws the plants shared by the Planting Guide and the Euclid game. This note describes the process for turning a real plant into a drawing, and what we found for each plant so far.

## The process

1. **Look at the leaves first.** Study close photographs of a single leaf. Note:
   - whether it is simple or compound (made of leaflets);
   - its shape: ovate (egg-shaped, widest near the base), lance (long and narrow), round or thread-like;
   - its tip: pointed or rounded;
   - its edge: smooth, toothed (serrate), wavy or lobed;
   - its surface: glossy, puckered or wrinkled;
   - its veins: one midrib with side veins, or a fan.
2. **Identify the plant's structure.** Botanical identification guides describe it more reliably than a single photo. Work out:
   - **leaf arrangement:** alternate (one leaf per node, sides taking turns) or opposite (pairs, often each pair turned a quarter turn from the last);
   - **branching:** one main stem with side shoots in the leaf angles, a stem that forks again and again, or a crown of leaf stalks at ground level;
   - **stem:** round or square, green or woody, smooth or hairy;
   - **flowers:** where they appear (in the leaf angles, at the forks, between the nodes, at the tips), whether singly or in groups, and how the group is shaped (a cluster, a spike of whorls, an umbrella-shaped umbel, a ball);
   - **fruit:** where it hangs, how many there are per group, its shape, and how its colour changes as it ripens (lower and older fruit ripen first).
3. **Build the drawing from those rules, not from one picture.**
   - Write one small drawing function per part: leaf, leaflet, flower, fruit, stem.
   - Write one function for a shoot that places those parts along a stem by the plant's rules: which nodes get leaves, which side, where the flowers or fruit go.
   - When the plant repeats itself, call the shoot function again at a smaller size. Tomato suckers and pepper forks are both done this way.
   - Seed the randomness, so each plant looks natural but is drawn the same way every time.
4. **Draw growth stages from the same structure.** Flowers go where fruit will be. Earlier stages show flowers and green fruit; later stages show ripe fruit, and then fading leaves.
5. **Shade for realism.**
   - Leaves get a lit half and a shaded half, a pale midrib and side veins, and gloss or a puckered texture where the real leaf has it.
   - Fruit gets a gradient and a glint.
   - Stems taper. Every plant sits on a soft shadow.
6. **Check it.**
   - Render every plant and stage side by side.
   - Compare against photographs, then adjust the proportions: leaf size against plant size, fruit size, and how far the branches spread.
   - Keep each change as a rule in the code, so it applies to every plant of that kind.

## What we found

- **Tomato** (Solanaceae).
  - **Stem and leaves:** a green, slightly hairy main stem. Compound leaves alternate up the stem: pairs of ovate, toothed, puckered leaflets, small leaflets between the pairs, and one leaflet at the tip.
  - **Trusses:** they grow between the nodes, on alternating sides. Each holds 3–7 fruit, or 7–16 for cherry tomatoes. Tomatoes carry more fruit per group than most plants built the same way. Earlier in the season the trusses hold flowers.
  - **Suckers:** a sucker grows in the angle between each leaf and the stem, and repeats the whole plant at a smaller size.
  - **Determinate vs indeterminate:** determinate plants stop in a truss. Indeterminate vines keep climbing.
- **Pepper and eggplant** (Solanaceae, the same family).
  - **Leaves:** simple, alternate and ovate, with a pointed tip and a smooth (entire) edge. Pepper leaves are glossy. Eggplant leaves are larger, grey-green and wavy-edged.
  - **Branching:** the stem grows a few leaves, then forks. One flower, and later one fruit, hangs at each fork, and two (sometimes three) branches go on and fork again.
  - **Flowers:** pepper flowers are white and star-shaped, with five to seven petals. Eggplant flowers are purple.
  - **Fruit:** a bell pepper hangs down, blocky, with three or four lobes. Fruit ripens from green to orange and red, the oldest (lowest) first. An eggplant is a long, glossy purple teardrop under a spiky green cap.
- **Mint family: basil, mint and thyme** (Lamiaceae).
  - **Stems and leaves:** square stems. Leaves grow in opposite pairs, each pair turned a quarter turn from the last, so in side view every other pair faces the viewer.
  - **Side shoots and flowers:** side shoots grow from the leaf angles. Flowers grow in whorls up a spike at each tip.
  - **Basil:** one upright stem with large, glossy, slightly cupped leaves and white flower spikes.
  - **Mint:** many spreading stems, with toothed, wrinkled leaves and lilac spikes.
  - **Thyme:** many thin woody stems, with tiny narrow leaves and small pink clusters.
- **Carrot family: parsley, cilantro and dill** (Apiaceae).
  - **Shape:** long leaf stalks rise from a crown at the ground.
  - **Leaves:** parsley's are cut into sharp-toothed leaflets of three lobes. Cilantro's lower leaves have rounded, toothed lobes and its upper leaves are feathery. Dill's are fine threads.
  - **Flowers:** when the plant bolts, tall stalks carry flowers in umbrellas (umbels), white for cilantro and yellow for dill.
- **Chives** (onion family): a clump of hollow, round-tipped tubes, with round purple flower heads on stalks.

## Sources

- Purdue Plant ID, pepper: https://hort.purdue.edu/plant-id-pal/Vegetables/pepper.html
- KPU Plant Database, sweet bell pepper: https://plantdatabase.kpu.ca/Plant/caan
- NParks Flora & Fauna Web, sweet pepper: https://www.nparks.gov.sg/florafaunaweb/flora/6/0/6081
- Pinova, morphological characteristics of pepper: https://pinova.hr/en/?p=10201
- Lamiaceae (UBC BIOL 343): https://blogs.ubc.ca/biol343/lamiaceae/
- Lamiaceae (Britannica): https://www.britannica.com/plant/Lamiaceae
