"""Make the Euclid game's one fixed building (world.js).

Every player walks the same building. It is laid out on a grid of 3 m cells, map first:
  - each of the 48 propositions is a lock room: a hall 1 cell wide and LEN cells long, running east,
    with its own finished figure on the east wall. Doors open in its north and south walls and its west end.
  - every dependency (u is used by c) is a walkable route from room u to room c. Routes run through
    connecting rooms that hold no lock (corridors and junctions). Routes share corridors where they can,
    and corridors that cross meet in a junction room, so the plan fits on one floor.
  - junctions where three or more ways meet are greenhouses, each with a garden whose size is rolled
    once, here, from a fixed seed.
The output is data only; game.html draws it and walks it.
Run from the repo root: python3 tools/make-world.py world.js  (writes world.js next to game.html)
"""
import heapq, itertools, json, random, sys
TIE = itertools.count()
from collections import defaultdict

USES = {1:[],2:[1],3:[2],4:[],5:[3,4],6:[3,4],7:[5],8:[7],9:[1,3,8],10:[1,4,9],11:[1,3,8],12:[8,10],13:[11],14:[13],15:[13],16:[3,4,10,15],17:[13,16],18:[3,5,16],19:[5,18],20:[3,5,19],21:[16,20],22:[3,20],23:[8,22],24:[3,4,5,19,23],25:[4,24],26:[3,4,16],27:[16],28:[13,15,27],29:[13,15],30:[27,29],31:[23,27],32:[13,29,31],33:[4,27,29],34:[4,26,29],35:[4,29,34],36:[33,34,35],37:[31,34,35],38:[31,34,36],39:[31,37],40:[31,38],41:[34,37],42:[10,23,31,38,41],43:[34],44:[15,29,31,42,43],45:[14,29,30,33,34,42,44],46:[3,11,29,31,34],47:[4,14,31,41,46],48:[3,8,11,47]}
IDS = list(USES)
KIDS = {i: [j for j in IDS if i in USES[j]] for i in IDS}
LEN = 3           # a lock room is 3 cells (about 9-13 m) long
DX, DY = 6, 4     # grid spacing of lock rooms: columns 6 cells apart, rows 4 apart
SEED = 1          # the building's one seed: change it and every player gets a new building

depth = {}
def dep(i):
    if i not in depth:
        depth[i] = 1 + max([dep(u) for u in USES[i]], default=0)
    return depth[i]
for i in IDS: dep(i)

# ---------- 1. place the lock rooms: one column per depth, rows ordered to keep routes short ----------
cols = defaultdict(list)
for i in IDS: cols[depth[i]].append(i)
order = {d: sorted(v) for d, v in cols.items()}
def pos_index():
    return {i: k for d in order for k, i in enumerate(order[d])}
for sweep in range(24):  # barycentre sweeps, both ways
    idx = pos_index()
    rng = sorted(order) if sweep % 2 == 0 else sorted(order, reverse=True)
    for d in rng:
        def bary(i):
            nb = USES[i] + KIDS[i]
            return sum(idx[n] / max(1, len(order[depth[n]]) - 1) for n in nb) / len(nb) if nb else 0.5
        order[d].sort(key=lambda i: (bary(i), i))
maxrows = max(len(v) for v in order.values())
room_at = {}   # id -> (x, y) of the west cell
# the depths are laid out in bands that run back and forth (like ploughed rows), so the plan is closer to square
BAND = 7
nb = (max(order) + BAND - 1) // BAND
brows = [max(len(order.get(d, [])) for d in range(b * BAND + 1, b * BAND + BAND + 1)) for b in range(nb)]
btop = [2 + sum(r - 1 for r in brows[:b]) * DY + 6 * b for b in range(nb)]
for d, ids in order.items():
    b, k0 = (d - 1) // BAND, (d - 1) % BAND
    col = k0 if b % 2 == 0 else BAND - 1 - k0
    off = (brows[b] - len(ids)) / 2
    for k, i in enumerate(ids):
        room_at[i] = (3 + col * DX, btop[b] + round((k + off) * DY))
# 48 is the last room you come to: alone past the end of the last band, with one door, a dead end
LAST = 48
lb = (depth[LAST] - 1) // BAND
order[depth[LAST]].remove(LAST)
EXTRA = int(sys.argv[2]) if len(sys.argv) > 2 else 0
room_at[LAST] = (3 + BAND * DX + EXTRA if lb % 2 == 0 else 3 - DX - LEN - EXTRA, btop[lb] + round((brows[lb] - 1) / 2 * DY))
if room_at[LAST][0] < 0:  # the last band runs west: shift the whole plan east to make room
    sh = -room_at[LAST][0] + 1
    room_at = {i: (x + sh, y) for i, (x, y) in room_at.items()}
W = 2 + max(x for x, y in room_at.values()) + LEN + 4
H = 2 + max(y for x, y in room_at.values()) + 3
cell_room = {}
for i, (x, y) in room_at.items():
    for k in range(LEN): cell_room[(x + k, y)] = i

def door_cells(i):
    """cells just outside room i where a door can open: along the north and south walls, and off the west end"""
    x, y = room_at[i]
    if i == LAST: return [(x - 1, y)] if lb % 2 == 0 else [(x + LEN, y)]
    out = [(x - 1, y)]
    for k in range(LEN): out += [(x + k, y - 1), (x + k, y + 1)]
    return [c for c in out if 0 <= c[0] < W and 0 <= c[1] < H and c not in cell_room]

# ---------- 2. route every dependency through lock-free corridors, sharing corridors where possible ----------
corr = set()            # corridor cells
links = set()           # walkable links between two corridor cells
doors = set()           # (room, corridor cell)
def route(u, c):
    starts, goals = door_cells(u), set(door_cells(c))
    pq, best, prev = [], {}, {}
    for s in starts:
        g = 0 if s in corr else 3
        best[(s, None)] = g; heapq.heappush(pq, (g, next(TIE), s, None))
    while pq:
        g, _, cur, dr = heapq.heappop(pq)
        if best.get((cur, dr), 1e9) < g: continue
        if cur in goals:
            path = [cur]; key = (cur, dr)
            while key in prev: key = prev[key]; path.append(key[0])
            return path[::-1]
        for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx = (cur[0] + d[0], cur[1] + d[1])
            if not (0 <= nx[0] < W and 0 <= nx[1] < H) or nx in cell_room: continue
            step = (1 if (cur, nx) in links or (nx, cur) in links else 1.6 if nx in corr else 3) + (0 if dr in (None, d) else 1.2)
            ng = g + step
            if ng < best.get((nx, d), 1e9):
                best[(nx, d)] = ng; prev[(nx, d)] = (cur, dr); heapq.heappush(pq, (ng, next(TIE), nx, d))
    raise SystemExit(f"no route {u}->{c}")
edges = sorted(((u, c) for c in IDS for u in USES[c]), key=lambda e: (abs(room_at[e[0]][0] - room_at[e[1]][0]) + abs(room_at[e[0]][1] - room_at[e[1]][1])))
routes = {}
for u, c in edges:
    p = route(u, c)
    routes[f"{u}-{c}"] = p
    doors.add((u, p[0])); doors.add((c, p[-1]))
    for a, b in zip(p, p[1:]): links.add((a, b))
    corr.update(p)
# the way in: a forecourt west of the building, with the two front doors (1 and 4)
ent = []
for i in (1, 4):
    x, y = room_at[i]
    p = [(xx, y) for xx in range(0, x)]
    ent.append(p); corr.update(p); doors.add((i, p[-1]))
    for a, b in zip(p, p[1:]): links.add((a, b))
fore = [(0, y) for y in range(min(room_at[1][1], room_at[4][1]), max(room_at[1][1], room_at[4][1]) + 1)]
corr.update(fore)
for a, b in zip(fore, fore[1:]): links.add((a, b))

# ---------- 3. cut the corridors into connecting rooms ----------
adj = defaultdict(set)
for a, b in links:
    adj[a].add(b); adj[b].add(a)
def straight(c):
    n = adj[c]
    if len(n) != 2: return False
    a, b = sorted(n)
    return a[0] == b[0] == c[0] or a[1] == b[1] == c[1]
conn_of, conns = {}, []
for c in sorted(corr):
    if c in conn_of: continue
    if not straight(c):            # junctions, turns and dead ends are rooms of their own
        conn_of[c] = len(conns); conns.append([c]); continue
    run = [c]; conn_of[c] = len(conns)
    for d in ((1, 0), (0, 1), (-1, 0), (0, -1)):
        nx = (c[0] + d[0], c[1] + d[1])
        while nx in adj[run[-1] if d[0] + d[1] > 0 else run[0]] and straight(nx) and nx not in conn_of:
            if d[0] + d[1] > 0: run.append(nx)
            else: run.insert(0, nx)
            conn_of[nx] = len(conns)
            nx = (nx[0] + d[0], nx[1] + d[1])
    conns.append(run)
for k, cells in enumerate(conns):
    if len(cells) == 1 and len(adj[cells[0]]) <= 2:
        c = cells[0]
        for n in sorted(adj[c]):
            j = conn_of[n]
            if j != k and conns[j] and (len(conns[j]) > 1 or len(adj[conns[j][0]]) <= 2):
                conns[j].append(c); conn_of[c] = j; conns[k] = []; break
keep = [i for i, cells in enumerate(conns) if cells]
remap = {old: new for new, old in enumerate(keep)}
conns = [conns[i] for i in keep]
conn_of = {c: remap[k] for c, k in conn_of.items()}
R = random.Random(SEED)
rooms = {}
for i in IDS:
    x, y = room_at[i]
    rooms[str(i)] = {"lock": True, "cells": [[x + k, y] for k in range(LEN)]}
CID0 = 100
for k, cells in enumerate(conns):
    cid = CID0 + k
    ways = len({conn_of[n] for c in cells for n in adj[c]} - {k}) + sum(1 for (r, dc) in doors if dc in cells)
    kind = "greenhouse" if len(cells) == 1 and len(adj[cells[0]]) + sum(1 for (r, dc) in doors if dc == cells[0]) >= 3 else "corridor"
    r = {"lock": False, "kind": kind, "cells": [list(c) for c in cells]}
    if kind == "greenhouse":   # a garden, its size rolled once, here: 8 x 16 up to 50 x 50
        w = 8 + round(R.random() ** 1.4 * 42); h = max(16, w + round(R.random() * (50 - w)))
        r["garden"] = {"seed": R.randrange(1, 10**6), "w": w, "h": h}
    # how deep in the book it is: the earliest proof whose way runs through it (sets its creatures, loot and traps)
    r["lvl"] = min([int(k.split("-")[0]) for k, p in routes.items() if any(tuple(c) in set(map(tuple, cells)) for c in p)] or [1]) or 1
    rooms[str(cid)] = r
for i in IDS:
    rooms[str(i)]["kind"] = ["corridor", "greenhouse", "library", "bedroom", "kitchen"][R.randrange(5)]
# doorways: between rooms (lock room <-> corridor, corridor <-> corridor)
ways = set()
for (r, c) in doors: ways.add(tuple(sorted((r, CID0 + conn_of[c]))))
for a, b in links:
    ka, kb = conn_of[a], conn_of[b]
    if ka != kb: ways.add(tuple(sorted((CID0 + ka, CID0 + kb))))
start = CID0 + conn_of[fore[0]]
# ---------- 4. corridors taken out by hand, after the rooms are numbered (so no other room changes) ----------
# 26 Nov 2026: the 9-cell corridor straight down from 4 to 21 let players loop between the two without finding the next lock
REMOVE = [[(5, y) for y in range(7, 16)]]
for cells in REMOVE:
    cs = set(cells)
    gone = [k for k, r in rooms.items() if not r["lock"] and {tuple(c) for c in r["cells"]} == cs]
    assert len(gone) == 1, f"no corridor is exactly {sorted(cs)}"
    gid = int(gone[0]); del rooms[gone[0]]
    ways = {w for w in ways if gid not in w}
    routes = {k: v for k, v in routes.items() if not cs & set(v)}
    for c in cs:           # and from the walking graph used by the checks below
        for m in adj.pop(c, set()): adj[m].discard(c)
    doors = {(r, c) for (r, c) in doors if c not in cs}
    corr -= cs
# every proof's door must still be reachable once what it relies on is solved (walking corridors and solved rooms)
nb = defaultdict(set)
for a, b in ways: nb[a].add(b); nb[b].add(a)
done = set()
for c in sorted(IDS):
    seen, q = {start}, [start]
    while q:
        n = q.pop()
        for m in nb[n]:
            if m not in seen and (m >= CID0 or m in done): seen.add(m); q.append(m)
    assert c in (1, 4) or nb[c] & seen, f"proof {c} cannot be reached"
    done.add(c)
# walking distance in metres (cells) from the way in to each lock room's nearest door: 48 must be the farthest
def walk_from_entrance():
    rdoors = defaultdict(list)
    for (r, dc) in doors: rdoors[r].append(dc)
    cd = {fore[0]: 0}; pq = [(0, next(TIE), fore[0])]
    while pq:   # you walk corridors cell by cell, and cross a lock room (LEN cells) from one of its doors to another
        g, _, c = heapq.heappop(pq)
        if g > cd[c]: continue
        nxt = [(m, 1) for m in adj[c]] + [(dc, LEN) for (r, d0) in doors if d0 == c and r != LAST for dc in rdoors[r] if dc != c]
        for m, w in nxt:
            if g + w < cd.get(m, 10**9): cd[m] = g + w; heapq.heappush(pq, (g + w, next(TIE), m))
    return {i: min(cd.get(dc, 10**6) for (r, dc) in doors if r == i) for i in IDS}
# 48 stays the last room: while another room is as far (taking corridors out can do that), 48 moves one cell further
# out and its own dead-end corridor grows by that cell. No other room changes.
for _ in range(40):
    walk = walk_from_entrance(); far = sorted(IDS, key=lambda i: -walk[i])[:4]
    if far[0] == LAST and walk[LAST] >= walk[far[1]] + 4: break
    d = next(c for (r, c) in doors if r == LAST); step = 1 if lb % 2 == 0 else -1
    k = next(k for k, r in rooms.items() if not r["lock"] and list(d) in r["cells"])
    nc = (d[0] + step, d[1]); rooms[k]["cells"].append(list(nc)); adj[d].add(nc); adj[nc].add(d)
    doors = {(r, nc if r == LAST else c) for (r, c) in doors}
    rooms[str(LAST)]["cells"] = [[x + step, y] for x, y in rooms[str(LAST)]["cells"]]
    W = max(W, max(x for x, y in rooms[str(LAST)]["cells"]) + 3)
else:
    sys.exit("48 could not be made the last room")
print("farthest lock rooms (cells walked):", [(i, walk[i]) for i in far])
world = {"v": 1, "seed": SEED, "cell": 3, "w": W, "h": H, "len": LEN, "start": start,
         "rooms": rooms, "ways": sorted([list(w) for w in ways]),
         "routes": {k: [list(c) for c in v] for k, v in routes.items()}}
out = sys.argv[1] if len(sys.argv) > 1 else "world.js"
with open(out, "w") as f:
    f.write("/* The Euclid game's building: one fixed plan for every player. Made by tools/make-world.py; do not edit by hand. */\n")
    f.write("window.WORLD=" + json.dumps(world, separators=(",", ":")) + ";\n")
nconn = sum(1 for r in rooms.values() if not r["lock"]); ngh = sum(1 for r in rooms.values() if r.get("kind") == "greenhouse" and not r["lock"])
print(f"grid {W}x{H}, lock rooms 48, connecting rooms {nconn} ({ngh} greenhouses), doorways {len(ways)}, corridor cells {len(corr)}")
deg = defaultdict(int)
for a, b in ways: deg[a] += 1; deg[b] += 1
print("most doors in one lock room:", max((deg[i], i) for i in IDS))
