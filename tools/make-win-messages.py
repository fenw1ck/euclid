"""Rebuild win-messages.csv: each proposition's name, win message, and who does the work.

Run from the repository folder:  python3 tools/make-win-messages.py
Needs Python Playwright and Chrome or Chromium (set CHROME=/path/to/chrome if Playwright's own browser is missing).
The names and win messages come from proofs.js, so edit them there and re-run this.

The goal is a learner who drags, swings and pulls: one who does the work, not one who clicks
through a slideshow. So a click counts as the engine's work, not the learner's.

User steps:     hands-on moves: drag, swing (pivot), sweep, pull (extend), slide, turn, flip;
                each gem dragged into a hollow counts as one.
Engine steps:   everything else the learner sits through = Taps + Watched frames.
  Taps:           one click and the engine does the work (a short version such as "Prop 31",
                  choosing a point, tapping a triangle, line or angle).
  Watched frames: frames of the proof animation, which the learner only watches.
Hands-on share: User steps / (User steps + Engine steps). Low numbers show where work is needed.
Engine work:    what the taps and frames are, to plan which ones become moves.
Lines the engine counts as already drawn are left out. Points the engine finds by itself
(where circles or lines cross) are instant and not counted.
"""
import asyncio, csv, os, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

HANDS_ON = {"line", "circ", "ext", "rot", "wrong", "push", "flip", "amatch", "smatch", "lift",
            "wcmp", "spinw", "turn", "raise", "lay", "gemin", "pretend", "straighten", "stretch", "morph", "spin", "string"}
TAP_NAMES = {"place": "choose a point", "tri": "tap a triangle", "tapseg": "tap a line",
             "rmark": "tap an angle", "wmark": "tap an angle", "tapang": "tap an angle"}
SHORT = {"midp", "par", "ang", "cpy", "cut", "bis", "perp", "pgram", "apl", "sq"}  # index.html's MAC: tap a short version

# Props 4 and 8 slide one triangle onto the other and have no ops or phases list.
# 4: drag AC onto DF, DE onto AB, the angle at A onto D, then drag the triangle and swing it: 5 moves; 1 frame (BC = EF).
# 8: drag the triangle, then swing it: 2 moves; 1 frame (the angles at A and D are equal).
SLIDE = {4: (5, [], 1), 8: (2, [], 1)}

COUNT = """async ([id,c])=>{CASE[id]=c;load(id);const kind=P.kind,ops=[];
  if(kind==='play')for(const o of OPS)if(!auto(o))ops.push({t:o.t,prop:o.prop||null,k:o.t==='line'?sk(o.a,o.b):null,n:o.t==='hollow'?o.gems.length:o.t==='stretch'?(o.pairs.every(([a,b])=>a[0]===b[0])?1:2):1});
  await solveAll();for(let k=0;k<300&&!W.won;k++)await new Promise(r=>setTimeout(r,20));
  const left=ops.filter(o=>!(o.t==='line'&&W.covered&&W.covered.has(o.k)));
  return{kind,name:P.t,win:P.winTxt||'',ops:left,frames:kind==='play'?P.phases(W).length:null,won:W.won}}"""

def classify(ops):
    user, taps = 0, []
    for o in ops:
        if o["t"] == "hollow":
            user += o["n"]  # one drag per gem
        elif o["t"] == "stretch":
            user += o["n"]  # drag the angle over (unless it shares the corner), then stretch it
        elif o["t"] in HANDS_ON:
            user += 1
        elif o["t"] in SHORT:
            taps.append(f"Prop {o['prop']}")
        elif o["t"] in TAP_NAMES:
            taps.append(TAP_NAMES[o["t"]])
        else:
            raise SystemExit(f"unclassified move type {o['t']!r}: add it to HANDS_ON, SHORT or TAP_NAMES")
    return user, taps

def describe(taps, frames):
    parts = []
    for name in dict.fromkeys(taps):
        n = taps.count(name)
        parts.append(name + (f" ×{n}" if n > 1 else ""))
    if frames:
        parts.append(f"{frames} watched frame" + ("s" if frames > 1 else ""))
    return "; ".join(parts)

async def main():
    async with async_playwright() as p:
        exe = os.environ.get("CHROME")
        b = await (p.chromium.launch(executable_path=exe) if exe else p.chromium.launch())
        pg = await b.new_page(viewport={"width": 800, "height": 900})
        await pg.add_init_script("window.FASTMODE=1;localStorage.clear()")
        await pg.goto((ROOT / "index.html").as_uri())
        rows = [["Prop", "Name", "Win message", "User steps", "Engine steps", "Taps", "Watched frames", "Hands-on share", "Engine work"]]
        for i in range(1, 49):
            n = await pg.evaluate("id=>{go(id);return (P.cases||[0]).length}", i)
            for c in range(n):
                r = await pg.evaluate(COUNT, [i, c])
                if not r["won"]:
                    print("not solved:", i, "case", c + 1)
                user, taps, frames = SLIDE[i] if i in SLIDE else (*classify(r["ops"]), r["frames"])
                engine = len(taps) + frames
                share = f"{round(100 * user / (user + engine))}%" if user + engine else ""
                rows.append([f"1.{i}" + (f" case {c + 1}" if n > 1 else ""), r["name"], r["win"],
                             user, engine, len(taps), frames, share, describe(taps, frames)])
        await b.close()
    with open(ROOT / "win-messages.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(rows)
    print("wrote win-messages.csv,", len(rows) - 1, "rows")

asyncio.run(main())
