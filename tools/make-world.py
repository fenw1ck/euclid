"""Make the Euclid game's one fixed building (world.js), v2 (27 Nov 2026).

The building is a house first, and the locks are put into it (it is no longer drawn from the map of what relies on what).
It is laid out on a grid of 3 m cells, x east, y south. Every room is a rectangle of cells, of one of five types
(corridor, library, bedroom, kitchen, greenhouse) and of its own width and depth. A greenhouse is just another type
of room: it joins nothing special.

  - The front: rooms 1 and 4 are the two vestibules behind the temple's front doors (locks 1 and 4, on their west walls).
    Both open into the entrance hall (room 100), so whichever front door you open first, the house is open to you.
  - Connecting rooms (ids 100 and up) hold no lock of their own: they are the house you walk through. The house is
    grown outwards from the entrance hall, room by room (each new room shares a wall with the room it grows from and
    has a doorway in that wall), breadth first, so rooms made later are further from the front doors.
  - Every other proposition n is a lock: a locked door in the wall of a connecting room (its host), leading into a small
    room of its own (room n) that shows its finished figure. Locks are handed out in order as the house grows, so
    the book runs outward from the front doors; a room can hold several locks (up to four).
  - A few extra doorways join connecting rooms that touch, so the house has loops (the Euler walk needs them), and
    some lock rooms get a second door, a shortcut into the next room, which opens with the same lock.
  - 48 is the last room: a dead end off the connecting room farthest from the front doors.

Floors are not chosen here: game.html gives each room the floor of the earliest proof it holds (see GAME_DESIGN.md 3d).
Rooms are fixed by SEED; change it and every player gets a new building.
Run from the repo root: python3 tools/make-world.py world.js
"""
import json, random, sys
from collections import deque, defaultdict

SEED = 3
USES = {1:[],2:[1],3:[2],4:[],5:[3,4],6:[3,4],7:[5],8:[7],9:[1,3,8],10:[1,4,9],11:[1,3,8],12:[8,10],13:[11],14:[13],15:[13],16:[3,4,10,15],17:[13,16],18:[3,5,16],19:[5,18],20:[3,5,19],21:[16,20],22:[3,20],23:[8,22],24:[3,4,5,19,23],25:[4,24],26:[3,4,16],27:[16],28:[13,15,27],29:[13,15],30:[27,29],31:[23,27],32:[13,29,31],33:[4,27,29],34:[4,26,29],35:[4,29,34],36:[33,34,35],37:[31,34,35],38:[31,34,36],39:[31,37],40:[31,38],41:[34,37],42:[10,23,31,38,41],43:[34],44:[15,29,31,42,43],45:[14,29,30,33,34,42,44],46:[3,11,29,31,34],47:[4,14,31,41,46],48:[3,8,11,47]}
IDS = list(USES)
LAST = 48
FRONT = (1, 4)
START = 100
LIMX, LIMY = 34, 16   # the plan stays inside x 0..LIMX, y -LIMY..LIMY (about square once drawn)
KINDS = ["corridor", "library", "bedroom", "kitchen", "greenhouse"]
# sizes (cells across x, cells down y) by type; both ways round are allowed
CONN_SIZES = {"corridor": [(1, 3), (1, 4), (1, 5), (1, 2)], "library": [(2, 3), (2, 4), (3, 3), (3, 4)],
              "bedroom": [(2, 2), (3, 3)], "kitchen": [(2, 2), (2, 3)], "greenhouse": [(2, 3), (3, 4), (2, 4), (3, 3)]}
CONN_W = {"corridor": .38, "library": .16, "bedroom": .14, "kitchen": .12, "greenhouse": .2}
LOCK_SIZES = {"corridor": [(1, 2), (1, 3)], "library": [(2, 2), (2, 3)], "bedroom": [(2, 2)], "kitchen": [(2, 2), (2, 3)], "greenhouse": [(2, 2), (2, 3)]}
SIDES = {"N": (0, -1), "S": (0, 1), "W": (-1, 0), "E": (1, 0)}


def build(seed):
    R = random.Random(seed)
    rooms, occ, used = {}, {}, set()      # used: (cell, d) sides that already have a doorway
    ways, doors = set(), {}

    def cells_of(x, y, w, h):
        return [(x + i, y + j) for i in range(w) for j in range(h)]

    def put(rid, x, y, w, h, kind, lock):
        cs = cells_of(x, y, w, h)
        for c in cs: occ[c] = rid
        rooms[rid] = {"lock": lock, "kind": kind, "x": x, "y": y, "w": w, "h": h, "cells": cs, "hosts": []}

    def door(a, ca, b, cb):
        d = (cb[0] - ca[0], cb[1] - ca[1])
        used.add((ca, d)); used.add((cb, (-d[0], -d[1])))
        ways.add(tuple(sorted((a, b))))
        doors[f"{a}>{b}"] = {"c": list(ca), "d": list(d)}
        doors[f"{b}>{a}"] = {"c": list(cb), "d": [-d[0], -d[1]]}

    def free(cs):
        return all(c not in occ and 0 <= c[0] <= LIMX and -LIMY <= c[1] <= LIMY for c in cs)

    def shared(a, b):
        """the cell pairs (cell of a, cell of b) across the wall a and b share, with no doorway on either side yet"""
        B = set(rooms[b]["cells"])
        out = []
        for c in rooms[a]["cells"]:
            for d in SIDES.values():
                n = (c[0] + d[0], c[1] + d[1])
                if n in B and (c, d) not in used and (n, (-d[0], -d[1])) not in used:
                    out.append((c, n))
        return out

    def attach(parent, rid, kind, sizes, lock):
        P = rooms[parent]
        for _ in range(160):
            w, h = R.choice(sizes)
            if R.random() < .5: w, h = h, w
            s = R.choice("NSWE")
            if s in "NS":
                x = R.randint(P["x"] - w + 1, P["x"] + P["w"] - 1)
                y = P["y"] - h if s == "N" else P["y"] + P["h"]
            else:
                y = R.randint(P["y"] - h + 1, P["y"] + P["h"] - 1)
                x = P["x"] - w if s == "W" else P["x"] + P["w"]
            cs = cells_of(x, y, w, h)
            if not free(cs): continue
            put(rid, x, y, w, h, kind, lock)
            sh = shared(parent, rid)
            if not sh:
                for c in cs: del occ[c]
                del rooms[rid]; continue
            ca, cb = R.choice(sh)
            door(parent, ca, rid, cb)
            return True
        return False

    def pick_kind():
        r, acc = R.random(), 0
        for k, w in CONN_W.items():
            acc += w
            if r < acc: return k
        return "corridor"

    # ---- the front: the entrance hall, with the two vestibules (rooms 1 and 4) on its west side
    put(START, 2, -2, 2, 5, "corridor", False)
    put(1, 0, -2, 2, 2, R.choice(KINDS), True)
    put(4, 0, 1, 2, 2, R.choice(KINDS), True)
    for n, cy in ((1, -2 + R.randint(0, 1)), (4, 1 + R.randint(0, 1))):
        doors[f"{n}>0"] = {"c": [0, cy], "d": [-1, 0]}; ways.add((0, n)); used.add(((0, cy), (-1, 0)))
        ca, cb = R.choice(shared(n, START)); door(n, ca, START, cb)
    # ---- grow the house outwards, breadth first, handing out the locks in order
    locks = [n for n in IDS if n not in FRONT and n != LAST]
    li, nxt, queue, order, parent = 0, START + 1, deque([START]), [], {}
    lvl = {}
    while li < len(locks):
        if not queue:     # every open room is full: grow a corridor off any room that still has space
            for r in R.sample(order, len(order)):
                if attach(r, nxt, "corridor", CONN_SIZES["corridor"], False):
                    parent[nxt] = r; queue.append(nxt); nxt += 1; break
            else:
                return None
            continue
        r = queue.popleft(); order.append(r)
        k = 2 if r == START else R.choices([0, 1, 2, 3, 4], [.16, .34, .3, .14, .06])[0]
        for _ in range(k):
            if li >= len(locks): break
            n = locks[li]; kind = R.choice(KINDS)
            if not attach(r, n, kind, LOCK_SIZES[kind], True): break
            rooms[r]["hosts"].append(n); li += 1
        lvl[r] = min(rooms[r]["hosts"]) if rooms[r]["hosts"] else (locks[li] if li < len(locks) else 47)
        want = -(-(len(locks) - li) * 2 // 3) - len(queue)        # about one open room for every 1.5 locks still to come
        nc = max(0, min(3, want)) + (1 if R.random() < .25 and len(locks) - li > 3 else 0)
        for _ in range(nc):
            kind = pick_kind()
            if attach(r, nxt, kind, CONN_SIZES[kind], False):
                parent[nxt] = r; queue.append(nxt); nxt += 1
    for r in list(queue): order.append(r); lvl[r] = 47
    # ---- loops: some connecting rooms that touch get a doorway between them
    conns = [r for r in rooms if not rooms[r]["lock"]]
    for a in conns:
        for b in conns:
            if a < b and tuple(sorted((a, b))) not in ways and R.random() < .3:
                sh = shared(a, b)
                if sh: ca, cb = R.choice(sh); door(a, ca, b, cb)
    # ---- shortcuts: a lock room that touches another connecting room may get a second door (it opens with the same lock)
    host = {n: r for r in conns for n in rooms[r]["hosts"]}
    for n in locks:
        if R.random() < .3:
            for b in R.sample(conns, len(conns)):
                if b != host[n] and shared(n, b):
                    ca, cb = R.choice(shared(n, b)); door(n, ca, b, cb); break
    # ---- 48, the last room: a dead end off the connecting room farthest from the front doors
    nb = defaultdict(set)
    for a, b in ways: nb[a].add(b); nb[b].add(a)
    dist = {START: 0}; q = deque([START])
    while q:
        a = q.popleft()
        for b in nb[a]:
            if b not in dist and b >= 100: dist[b] = dist[a] + 1; q.append(b)
    for r in sorted(conns, key=lambda r: -dist.get(r, -1)):
        kind = R.choice(KINDS)
        if attach(r, LAST, kind, LOCK_SIZES[kind], True):
            rooms[r]["hosts"].append(LAST); host[LAST] = r; break
    else:
        return None
    for n in FRONT: host[n] = 0
    return rooms, ways, doors, lvl, host, dist


def check(rooms, ways, host):
    """every proof's door can be reached as soon as everything it relies on is solved (in the book's order),
    walking from the front doors through connecting rooms and solved lock rooms"""
    nb = defaultdict(set)
    for a, b in ways: nb[a].add(b); nb[b].add(a)
    done = set()
    for n in sorted(IDS):
        if n not in FRONT:
            seen = set(m for m in FRONT if m in done)
            q = list(seen)
            while q:
                a = q.pop()
                for b in nb[a]:
                    if b and b not in seen and (b >= 100 or b in done): seen.add(b); q.append(b)
            if host[n] not in seen: return f"proof {n}: its door (in room {host[n]}) cannot be reached"
        done.add(n)
    return None


def walk_cells(rooms, ways, doors):
    """metres walked (in cells, door to door) from the front doors to each lock's door"""
    import heapq
    nb = defaultdict(list)
    for a, b in ways: nb[a].append(b); nb[b].append(a)
    best = {}; pq = []
    for n in FRONT:
        best[(n, tuple(doors[f"{n}>0"]["c"]))] = 0; heapq.heappush(pq, (0, n, tuple(doors[f"{n}>0"]["c"])))
    far = {}
    while pq:
        g, r, c = heapq.heappop(pq)
        if best.get((r, c), 1e9) < g: continue
        for m in nb[r]:
            if m == 0: continue
            dc = tuple(doors[f"{r}>{m}"]["c"]); g2 = g + abs(dc[0] - c[0]) + abs(dc[1] - c[1]) + 1
            if m < 100: far[m] = min(far.get(m, 1e9), g2)
            mc = tuple(doors[f"{m}>{r}"]["c"])
            if g2 < best.get((m, mc), 1e9): best[(m, mc)] = g2; heapq.heappush(pq, (g2, m, mc))
    return far


for s in range(SEED, SEED + 400):
    out = build(s)
    if not out: continue
    rooms, ways, doors, lvl, host, dist = out
    err = check(rooms, ways, host)
    if err: continue
    far = walk_cells(rooms, ways, doors)
    top = sorted(far, key=lambda i: -far[i])
    if top[0] != LAST: continue
    break
else:
    sys.exit("no building found")
# shift so the plan starts at x 1, y 1
xs = [c[0] for r in rooms.values() for c in r["cells"]]; ys = [c[1] for r in rooms.values() for c in r["cells"]]
ox, oy = 1 - min(xs), 1 - min(ys)
W, H = max(xs) + ox + 2, max(ys) + oy + 2
outr = {}
for rid, r in sorted(rooms.items()):
    o = {"lock": r["lock"], "kind": r["kind"], "cells": [[x + ox, y + oy] for x, y in r["cells"]]}
    if r["lock"]: o["host"] = host[rid]
    else:
        o["hosts"] = sorted(r["hosts"]); o["lvl"] = lvl.get(rid, 47)
    outr[str(rid)] = o
outd = {k: {"c": [v["c"][0] + ox, v["c"][1] + oy], "d": v["d"]} for k, v in doors.items()}
world = {"v": 2, "seed": s, "cell": 3, "w": W, "h": H, "start": START, "rooms": outr,
         "ways": sorted([list(w) for w in ways]), "doors": outd}
dst = sys.argv[1] if len(sys.argv) > 1 else "world.js"
with open(dst, "w") as f:
    f.write("/* The Euclid game's building: one fixed plan for every player. Made by tools/make-world.py; do not edit by hand. */\n")
    f.write("window.WORLD=" + json.dumps(world, separators=(",", ":")) + ";\n")
conn = [r for r in rooms if not rooms[r]["lock"]]
multi = sorted((len(rooms[r]["hosts"]), r) for r in conn if len(rooms[r]["hosts"]) > 1)
print(f"seed {s}: grid {W}x{H}, lock rooms 48, connecting rooms {len(conn)}, doorways {len(ways)}")
print("kinds:", {k: sum(1 for r in rooms.values() if r['kind'] == k) for k in KINDS})
print("rooms holding several locks:", [(r, rooms[r]['hosts']) for _, r in multi])
print("farthest locks (cells walked):", [(i, far[i]) for i in top[:4]])
