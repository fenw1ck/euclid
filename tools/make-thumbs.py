"""Rebuild thumbs.js: the final figure of each proposition, for the home page.

Run from the repository folder:  python3 tools/make-thumbs.py
Needs Python Playwright and Chrome or Chromium. Each proposition is opened, solved with
"Solve it for me" in fast mode, and its finished SVG figure is saved (pulses, arrows,
the hand and captions removed; numbers rounded). The thumbnails use the page's CSS
colour variables, so they follow light and dark mode.
"""
import asyncio, json, pathlib, re
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 800, "height": 900})
        await pg.add_init_script("window.FASTMODE=1;localStorage.clear()")
        await pg.goto((ROOT / "index.html").as_uri())
        out = {}
        for i in range(1, 49):
            r = await pg.evaluate("""async id=>{go(id);await solveAll();for(let k=0;k<200&&!W.won;k++)await new Promise(r=>setTimeout(r,20));if(P.kind==='play')fit();await new Promise(r=>setTimeout(r,30));
            const c=svg.cloneNode(true);c.querySelectorAll('.pulse,.arrow,.cursor,.tag,.flash').forEach(e=>e.remove());return{won:W.won,vb:svg.getAttribute('viewBox'),h:c.innerHTML}}""", i)
            if not r["won"]:
                print("not solved:", i)
            out[i] = {"vb": " ".join(str(round(float(x), 1)) for x in r["vb"].split()), "h": re.sub(r"(\d+\.\d)\d+", r"\1", r["h"])}
        js = "/* final figures for the home page thumbnails, made by tools/make-thumbs.py */\nwindow.THUMBS=" + json.dumps(out, separators=(",", ":")) + ";\n"
        (ROOT / "thumbs.js").write_text(js)
        print("wrote thumbs.js,", len(js), "bytes")
        await b.close()

asyncio.run(main())
