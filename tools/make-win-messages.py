"""Rebuild win-messages.csv: each proposition's name, win message and step counts.

Run from the repository folder:  python3 tools/make-win-messages.py
Needs Python Playwright and Chrome or Chromium (set CHROME=/path/to/chrome if Playwright's own browser is missing).
The names and win messages come from proofs.js, so edit them there and re-run this.

User steps:   the moves the learner makes by hand in a full play-through, with short versions
              (a tap on a flashing preview counts as one move). Lines the engine counts as
              already drawn are left out.
Engine steps: the frames of the proof animation, which the learner only watches. Roadmap step 2
              turns these into moves the learner makes (snap-and-swivel drags).
"""
import asyncio, csv, os, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Props 4 and 8 slide one triangle onto the other and have no ops or phases list.
# 4: drag AC onto DF, DE onto AB, the angle at A onto D, then drag the triangle and swing it (5 moves); 1 frame: BC = EF.
# 8: drag the triangle, then swing it (2 moves); 1 frame: the angles at A and D are equal.
SLIDE = {4: (5, 1), 8: (2, 1)}

COUNT = """async ([id,c])=>{CASE[id]=c;load(id);const kind=P.kind;let user=0;
  if(kind==='play')for(const o of OPS)if(!auto(o))user++;
  await solveAll();for(let k=0;k<300&&!W.won;k++)await new Promise(r=>setTimeout(r,20));
  if(kind==='play')for(const o of OPS)if(o.t==='line'&&W.covered&&W.covered.has(sk(o.a,o.b)))user--;
  return{kind,name:P.t,win:P.winTxt||'',user,engine:kind==='play'?P.phases(W).length:null,won:W.won}}"""

async def main():
    async with async_playwright() as p:
        exe = os.environ.get("CHROME")
        b = await (p.chromium.launch(executable_path=exe) if exe else p.chromium.launch())
        pg = await b.new_page(viewport={"width": 800, "height": 900})
        await pg.add_init_script("window.FASTMODE=1;localStorage.clear()")
        await pg.goto((ROOT / "index.html").as_uri())
        rows = [["Prop", "Name", "Win message", "User steps", "Engine steps"]]
        for i in range(1, 49):
            n = await pg.evaluate("id=>{go(id);return (P.cases||[0]).length}", i)
            for c in range(n):
                r = await pg.evaluate(COUNT, [i, c])
                if not r["won"]:
                    print("not solved:", i, "case", c + 1)
                user, engine = SLIDE.get(i, (r["user"], r["engine"]))
                rows.append([f"1.{i}" + (f" case {c + 1}" if n > 1 else ""), r["name"], r["win"], user, engine])
        await b.close()
    with open(ROOT / "win-messages.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(rows)
    print("wrote win-messages.csv,", len(rows) - 1, "rows")

asyncio.run(main())
