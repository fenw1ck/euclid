/* Garden assets and garden plans, shared by the Euclid game and (later) the Planting Guide.
   The art package source is github.com/fenw1ck/art-assets; copy this file in at release.
   Needs plants.js (window.PLANTS) for the plants themselves.

   window.GARDEN.plan(seed)            a garden: size (8×16 up to 50×50), theme, paths, beds, plants and props
   window.GARDEN.render(plan, s, o)    the still parts (ground, paths, beds, plants, benches, trellises, tools) on a canvas, s px per cell;
                                       o.wild: an abandoned greenhouse floor (irregular flagstone or dirt paths, moss and grass creeping in)
   window.GARDEN.fountain(ctx,x,y,s,t) a working fountain, centre (x,y), s px per cell, t seconds (animated water)
   window.GARDEN.lantern(ctx,x,y,s,t)  a lantern seen from above, lit
   window.GARDEN.chest(ctx,x,y,s,open) a treasure chest
   window.GARDEN.pedestal(ctx,x,y,s)   a stone pedestal for a lock plate
   window.GARDEN.gate(ctx,x,y,s)       the garden gate back to the greenhouse
   Every piece is seeded, so the same garden looks the same on every visit. */
(function(){
"use strict";
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const THEMES={
 herb:["basil","mint","thyme","parsley","cilantro","dill","chives","lavender"],
 vegetable:["tomato_indeterminate","tomato_cherry","pepper_bell","eggplant","bean_bush","lettuce","carrot","beet","kale","cabbage","onion","squash_summer","chard","radish"],
 fruit:["strawberry","raspberry","blueberry","apple","pear","peach","fig","rhubarb"],
 flower:["marigold_french","zinnia","sunflower","nasturtium","lavender"],
};
THEMES.mixed=[...new Set([].concat(THEMES.herb.slice(0,4),THEMES.vegetable.slice(0,6),THEMES.fruit.slice(0,3),THEMES.flower.slice(0,3)))];
const CLIMB=new Set(["tomato_indeterminate","tomato_cherry","bean_pole","pea","cucumber","raspberry"]);
const NAMES={herb:"Herb garden",vegetable:"Kitchen garden",fruit:"Orchard and berries",flower:"Flower garden",mixed:"Mixed garden"};

/* ---- the plan ---- */
function plan(seed){const r=rng(seed);
 const w=8+Math.round(Math.pow(r(),1.4)*42),h=Math.max(16,w+Math.round(r()*(50-w))),themeName=Object.keys(THEMES)[Math.floor(r()*5)],theme=THEMES[themeName];
 const PATH=1,BED=2,GRASS=0,cell=new Uint8Array(w*h),at=(x,y)=>cell[y*w+x],set=(x,y,v)=>{if(x>=0&&y>=0&&x<w&&y<h)cell[y*w+x]=v};
 /* paths: a ring round the edge, a spine up the middle, cross paths every 7 or 8 rows, and more spines in a wide garden */
 const vx=[0,w-1],hy=[0,h-1],sp=Math.floor(w/2);vx.push(sp);if(w>=22){const k=Math.floor((w-1)/10);for(let i=1;i<k;i++){const x=Math.round(i*(w-1)/k);if(Math.abs(x-sp)>3)vx.push(x)}}
 const step=7+Math.floor(r()*2);for(let y=step;y<h-4;y+=step)hy.push(y);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(vx.includes(x)||hy.includes(y))set(x,y,PATH);
 /* beds: the rectangles between the paths, one plant each */
 const xs=[...new Set(vx)].sort((a,b)=>a-b),ys=[...new Set(hy)].sort((a,b)=>a-b),beds=[];
 for(let j=0;j+1<ys.length;j++)for(let i=0;i+1<xs.length;i++){const x0=xs[i]+1,x1=xs[i+1]-1,y0=ys[j]+1,y1=ys[j+1]-1;if(x1<x0||y1<y0)continue;beds.push({x:x0,y:y0,w:x1-x0+1,h:y1-y0+1})}
 /* a fountain where the spine meets the middle cross path, on a paved square */
 let fountain=null;if(w>=11&&h>=18){const my=ys.reduce((b,y)=>Math.abs(y-h/2)<Math.abs(b-h/2)?y:b,ys[1]||ys[0]);fountain={x:sp,y:my};for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)set(sp+dx,my+dy,PATH)}
 const plants=[],props=[],ids=(window.PLANTS&&PLANTS.byId)||{};let k0=Math.floor(r()*theme.length);
 for(const b of beds){for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(at(x,y)===GRASS)set(x,y,BED);
  const id=theme[(k0++)%theme.length],p=ids[id];if(!p)continue;b.plant=id;const sp2=Math.max(1,Math.min(4,Math.round((p.mature_spread_in||12)/18)));
  for(let y=b.y+b.h-1;y>=b.y;y-=sp2)for(let x=b.x;x<b.x+b.w;x+=sp2)if(at(x,y)===BED&&!(fountain&&Math.abs(x-fountain.x)<=1&&Math.abs(y-fountain.y)<=1))plants.push({x:x+Math.min(sp2,b.x+b.w-x)/2,y:y+1,id,seed:Math.floor(r()*1e6),s:Math.min(sp2,4)});
  if(CLIMB.has(id)&&b.w>=2)props.push({t:"trellis",x:b.x,y:b.y,w:b.w})}
 /* lanterns where paths cross; benches facing the beds; a few tools left about */
 const cross=[];for(const y of ys)for(const x of xs)cross.push([x,y]);
 for(const[x,y]of cross)if(!(fountain&&Math.abs(x-fountain.x)<=1&&Math.abs(y-fountain.y)<=1)&&r()<.75)props.push({t:"lantern",x:x+.5,y:y+.5});
 const nb=Math.max(1,Math.round(w*h/180));for(let i=0;i<nb;i++){const y=ys[1+Math.floor(r()*Math.max(1,ys.length-2))]||ys[0],x=1+Math.floor(r()*(w-2));if(at(x,y)===PATH&&x!==sp)props.push({t:"bench",x:x+.5,y:y+.5,rot:0})}
 const tools=["wheelbarrow","can","rake","spade"],nt=1+Math.floor(r()*3);for(let i=0;i<nt&&beds.length;i++){const b=beds[Math.floor(r()*beds.length)];props.push({t:"tool",kind:tools[Math.floor(r()*tools.length)],x:b.x+.5+r()*(b.w-1),y:b.y+b.h-.3})}
 /* spots for lock pedestals (where cross paths meet the spine, away from the gate and fountain), the treasure spot, the gate */
 const spots=cross.filter(([x,y])=>x===sp&&y>0&&y<h-1&&!(fountain&&y===fountain.y)).concat(cross.filter(([x,y])=>x!==sp&&y>0&&y<h-1&&x>0&&x<w-1)).map(([x,y])=>({x:x+.5,y:y+.5}));
 if(spots.length<3){for(const y of ys.filter(y=>y>0&&y<h-1))for(const x of[1,w-2])spots.push({x:x+.5,y:y+.5})}
 if(spots.length<3)spots.push({x:sp+.5,y:Math.max(1.5,h*.25)},{x:sp+.5,y:h*.5},{x:sp+.5,y:h*.75});
 const far=beds.length?beds.reduce((a,b)=>b.y<a.y||(b.y===a.y&&b.x>a.x)?b:a):{x:1,y:1,w:1,h:1},treasure={x:far.x+far.w-.5,y:far.y+.5};
 const pi=plants.findIndex(q=>Math.abs(q.x-treasure.x)<1.2&&Math.abs(q.y-.5-treasure.y)<1.2);if(pi>=0)plants.splice(pi,1);
 return{seed,w,h,theme:themeName,name:NAMES[themeName],cell,beds,plants,props,fountain,spots,treasure,gate:{x:sp+.5,y:h-.5}}}

/* ---- still parts ---- */
function grass(g,w,h,s,r){g.fillStyle="#5d8a45";g.fillRect(0,0,w*s,h*s);for(let i=0;i<w*h*6;i++){const x=r()*w*s,y=r()*h*s;g.fillStyle=r()<.5?"rgba(120,170,80,.35)":"rgba(40,70,30,.3)";g.fillRect(x,y,1.2,1.2+r()*2.2)}}
function pathTile(g,x,y,s,r,stone){const X=x*s,Y=y*s;g.fillStyle=stone?"#c9b99a":"#d2c39f";g.fillRect(X,Y,s,s);
 if(stone){g.strokeStyle="rgba(90,75,55,.35)";g.lineWidth=1;const o=(y%2)*s/2;for(let k=-1;k<2;k++){g.strokeRect(X+o+k*s+.5,Y+.5,s-1,s/2-1);g.strokeRect(X+k*s+.5,Y+s/2+.5,s-1,s/2-1)}}
 else for(let i=0;i<s*.9;i++){g.fillStyle=r()<.5?"rgba(120,105,80,.4)":"rgba(255,250,235,.45)";g.beginPath();g.arc(X+r()*s,Y+r()*s,.6+r()*1.1,0,7);g.fill()}}
function bedTile(g,x,y,s,r){const X=x*s,Y=y*s;g.fillStyle="#6b4a2f";g.fillRect(X,Y,s,s);for(let i=0;i<s*.7;i++){g.fillStyle=r()<.5?"rgba(40,25,15,.45)":"rgba(150,110,75,.35)";g.fillRect(X+r()*s,Y+r()*s,1.5,1.2)}g.fillStyle="rgba(0,0,0,.12)";g.fillRect(X,Y+s*.5,s,1)}
function bedEdge(g,b,s){g.strokeStyle="#8a6a44";g.lineWidth=Math.max(2,s*.12);g.strokeRect(b.x*s+1,b.y*s+1,b.w*s-2,b.h*s-2);g.strokeStyle="rgba(255,235,200,.25)";g.lineWidth=1;g.strokeRect(b.x*s+2,b.y*s+2,b.w*s-4,b.h*s-4)}
function bench(g,x,y,s){g.save();g.translate(x*s,y*s);const L=s*1.6,D=s*.42;g.fillStyle="rgba(0,0,0,.25)";g.fillRect(-L/2+2,-D/2+3,L,D);g.fillStyle="#7a5232";for(let i=0;i<3;i++)g.fillRect(-L/2,-D/2+i*D/3,L,D/3-1);g.fillStyle="#3b3b3b";g.fillRect(-L/2+2,-D/2-2,3,D+4);g.fillRect(L/2-5,-D/2-2,3,D+4);g.fillStyle="#9a6c44";g.fillRect(-L/2,-D/2-D*.45,L,D*.32);g.restore()}
function trellis(g,b,s,r){const y=b.y*s+2,x0=b.x*s+3,x1=(b.x+b.w)*s-3;g.strokeStyle="#9b7b4f";g.lineWidth=Math.max(2,s*.1);g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();g.lineWidth=1.2;for(let x=x0;x<=x1;x+=s*.5){g.beginPath();g.moveTo(x,y-s*.15);g.lineTo(x,y+s*.15);g.stroke()}
 g.strokeStyle="#4e7a35";g.lineWidth=1.6;g.beginPath();g.moveTo(x0,y);for(let x=x0;x<=x1;x+=4)g.lineTo(x,y+Math.sin(x*.35)*s*.12);g.stroke();for(let x=x0;x<x1;x+=s*.35){g.fillStyle=r()<.5?"#5f9a45":"#467a36";g.beginPath();g.ellipse(x,y+(r()-.5)*s*.2,s*.12,s*.07,r()*3,0,7);g.fill()}}
function tool(g,kind,x,y,s){g.save();g.translate(x*s,y*s);g.fillStyle="rgba(0,0,0,.22)";g.beginPath();g.ellipse(2,3,s*.45,s*.18,0,0,7);g.fill();
 if(kind==="wheelbarrow"){g.fillStyle="#6c7f8a";g.beginPath();g.moveTo(-s*.4,-s*.2);g.lineTo(s*.25,-s*.25);g.lineTo(s*.3,s*.15);g.lineTo(-s*.35,s*.2);g.closePath();g.fill();g.fillStyle="#89a0ad";g.fillRect(-s*.3,-s*.16,s*.5,s*.08);g.fillStyle="#2a2a2a";g.beginPath();g.arc(s*.38,0,s*.1,0,7);g.fill();g.strokeStyle="#7a5232";g.lineWidth=2;g.beginPath();g.moveTo(-s*.4,-s*.15);g.lineTo(-s*.7,-s*.25);g.moveTo(-s*.38,s*.15);g.lineTo(-s*.7,s*.2);g.stroke()}
 else if(kind==="can"){g.fillStyle="#5b8a8f";g.beginPath();g.ellipse(0,0,s*.22,s*.18,0,0,7);g.fill();g.strokeStyle="#5b8a8f";g.lineWidth=3;g.beginPath();g.moveTo(s*.15,-s*.05);g.lineTo(s*.48,-s*.22);g.stroke();g.fillStyle="#7fb0b5";g.beginPath();g.ellipse(-s*.05,-s*.05,s*.12,s*.08,0,0,7);g.fill()}
 else{g.strokeStyle="#7a5232";g.lineWidth=2.4;g.beginPath();g.moveTo(-s*.6,s*.1);g.lineTo(s*.4,-s*.05);g.stroke();g.fillStyle="#777";if(kind==="rake"){g.fillRect(s*.38,-s*.22,s*.06,s*.36);for(let i=0;i<5;i++)g.fillRect(s*.44,-s*.2+i*s*.08,s*.08,2)}else{g.beginPath();g.moveTo(s*.38,-s*.14);g.lineTo(s*.62,-s*.1);g.lineTo(s*.6,s*.06);g.lineTo(s*.38,s*.04);g.closePath();g.fill()}}
 g.restore()}
/* wild floors (an abandoned greenhouse): paths of irregular flagstones with moss in the joints, or packed dirt;
   grass creeping in from the edges. Research: research/patterns/floors.md (irregular flagstone). */
function flagTile(g,x,y,s,r){const X=x*s,Y=y*s;g.fillStyle="#4f6a35";g.fillRect(X,Y,s,s); /* the joint: soil and moss */
 for(let i=0;i<s*.5;i++){g.fillStyle=r()<.5?"rgba(110,150,70,.6)":"rgba(60,45,30,.4)";g.fillRect(X+r()*s,Y+r()*s,1.5,1.5)}
 const n=1+Math.floor(r()*3),cells=n===1?[[0,0,1,1]]:n===2?(r()<.5?[[0,0,.5,1],[.5,0,.5,1]]:[[0,0,1,.5],[0,.5,1,.5]]):[[0,0,.55,.55],[.55,0,.45,.55],[0,.55,1,.45]];
 for(const[a,b,w,h]of cells){const cx=X+(a+w/2)*s,cy=Y+(b+h/2)*s,k=6+Math.floor(r()*3),base=["#a9a194","#9c9486","#b5ab98","#8f8a80"][Math.floor(r()*4)];g.beginPath();
  for(let i=0;i<k;i++){const t=i/k*Math.PI*2+r()*.4,rx=w*s*(.4+r()*.08),ry=h*s*(.4+r()*.08);g.lineTo(cx+Math.cos(t)*rx,cy+Math.sin(t)*ry)}g.closePath();
  g.fillStyle=base;g.fill();g.strokeStyle="rgba(50,45,38,.45)";g.lineWidth=1;g.stroke();g.save();g.clip();g.fillStyle="rgba(255,250,235,.18)";g.fillRect(cx-w*s/2,cy-h*s/2,w*s,h*s*.3); /* lit from above-left */
  for(let i=0;i<4;i++){g.fillStyle="rgba(60,55,45,.25)";g.fillRect(cx+(r()-.5)*w*s*.7,cy+(r()-.5)*h*s*.7,1.5,1)}g.restore()}}
function dirtTile(g,x,y,s,r){const X=x*s,Y=y*s;g.fillStyle="#8a6b48";g.fillRect(X,Y,s,s);for(let i=0;i<s*.8;i++){g.fillStyle=r()<.4?"rgba(60,42,25,.4)":r()<.7?"rgba(180,150,110,.4)":"rgba(140,135,125,.7)";g.beginPath();g.arc(X+r()*s,Y+r()*s,.5+r()*1.2,0,7);g.fill()}}
function tufts(g,P,s,r){const at=(x,y)=>x<0||y<0||x>=P.w||y>=P.h?-1:P.cell[y*P.w+x];
 for(let y=0;y<P.h;y++)for(let x=0;x<P.w;x++){const v=at(x,y);if(v!==1)continue;const edge=[at(x-1,y),at(x+1,y),at(x,y-1),at(x,y+1)].some(q=>q!==1),n=edge?5:r()<.35?2:0;
  for(let i=0;i<n;i++){const px=(x+r())*s,py=(y+r())*s,h=s*(.12+r()*.18);g.strokeStyle=r()<.5?"#6f9a48":"#4f7a35";g.lineWidth=1;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(px,py);g.lineTo(px+k*h*.5,py-h);g.stroke()}
   if(r()<.15){g.fillStyle=["#f2e7a0","#e9b7d6","#ffffff"][Math.floor(r()*3)];g.beginPath();g.arc(px,py-h,1.6,0,7);g.fill()}}}}
function render(P,s,o){o=o||{};const c=document.createElement("canvas");c.width=Math.ceil(P.w*s);c.height=Math.ceil(P.h*s);const g=c.getContext("2d"),r=rng(P.seed^0x5eed),stone=P.theme==="flower"||P.theme==="fruit",wild=o.wild?(rng(P.seed^0xf1a9)()<.6?"flag":"dirt"):null;
 grass(g,P.w,P.h,s,r);for(let y=0;y<P.h;y++)for(let x=0;x<P.w;x++){const v=P.cell[y*P.w+x];if(v===1)(wild==="flag"?flagTile(g,x,y,s,r):wild==="dirt"?dirtTile(g,x,y,s,r):pathTile(g,x,y,s,r,stone));else if(v===2)bedTile(g,x,y,s,r)}
 if(wild)tufts(g,P,s,r);
 for(const b of P.beds)bedEdge(g,b,s);for(const q of P.props)if(q.t==="trellis")trellis(g,q,s,r);
 /* plants, back to front, standing on their cell */
 const L=P.plants.slice().sort((a,b)=>a.y-b.y);if(window.PLANTS)for(const q of L){const p=PLANTS.byId[q.id];if(p)PLANTS.drawFit(g,p,q.x*s,q.y*s-s*.12,s*q.s*.95,"mature",q.seed)}
 for(const q of P.props){if(q.t==="bench")bench(g,q.x,q.y,s);else if(q.t==="tool")tool(g,q.kind,q.x,q.y,s)}
 return c}

/* ---- live parts ---- */
function fountain(ctx,x,y,s,t){const R=s*1.35;ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(3,4,R,R*.9,0,0,7);ctx.fill();
 ctx.fillStyle="#b9ad98";ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.strokeStyle="#8d8270";ctx.lineWidth=2;ctx.stroke();
 const wg=ctx.createRadialGradient(-R*.2,-R*.2,R*.1,0,0,R*.85);wg.addColorStop(0,"#9fd3e6");wg.addColorStop(1,"#3f7f9c");ctx.fillStyle=wg;ctx.beginPath();ctx.arc(0,0,R*.82,0,7);ctx.fill();
 ctx.strokeStyle="rgba(255,255,255,.5)";ctx.lineWidth=1.2;for(let k=0;k<3;k++){const u=((t*.6+k/3)%1);ctx.globalAlpha=1-u;ctx.beginPath();ctx.arc(0,0,R*(.2+.6*u),0,7);ctx.stroke()}ctx.globalAlpha=1;
 ctx.fillStyle="#cfc4b0";ctx.beginPath();ctx.arc(0,0,R*.22,0,7);ctx.fill();for(let k=0;k<10;k++){const a=k*.628+t*.4,d=R*(.25+.15*((t*2+k*.37)%1));ctx.fillStyle="rgba(220,245,255,.8)";ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d,1.3,0,7);ctx.fill()}ctx.restore()}
function lantern(ctx,x,y,s,t){const g=ctx.createRadialGradient(x,y,0,x,y,s*1.4);g.addColorStop(0,`rgba(255,210,120,${.35+.08*Math.sin(t*3+x)})`);g.addColorStop(1,"rgba(255,210,120,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,s*1.4,0,7);ctx.fill();
 ctx.fillStyle="#2f2f2f";ctx.beginPath();ctx.arc(x,y,s*.22,0,7);ctx.fill();ctx.fillStyle="#ffd98a";ctx.beginPath();ctx.arc(x,y,s*.13,0,7);ctx.fill()}
function chest(ctx,x,y,s,open){const w=s*.9,h=s*.6;ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(-w/2+2,-h/2+3,w,h);ctx.fillStyle="#7a4a24";ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle="#c9a03c";ctx.fillRect(-w/2,-h/2,w,3);ctx.fillRect(-w/2,h/2-3,w,3);ctx.fillRect(-2,-h/2,4,h);
 if(open){ctx.fillStyle="#3a2210";ctx.fillRect(-w/2+3,-h/2+3,w-6,h-6);ctx.fillStyle="#f2cf55";for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(-w/4+i*w/8,0,2.2,0,7);ctx.fill()}}else{ctx.fillStyle="#e7c45c";ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fill()}ctx.restore()}
function pedestal(ctx,x,y,s){const R=s*.85;ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(3,4,R*1.05,R*.95,0,0,7);ctx.fill();ctx.fillStyle="#a49a8a";ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R)}ctx.closePath();ctx.fill();ctx.strokeStyle="#7d7466";ctx.lineWidth=1.5;ctx.stroke();ctx.restore()}
function gate(ctx,x,y,s){ctx.save();ctx.translate(x,y);ctx.strokeStyle="#2c2c2c";ctx.lineWidth=2;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*s*.22,-s*.45);ctx.lineTo(i*s*.22,s*.45);ctx.stroke()}ctx.beginPath();ctx.moveTo(-s*.75,-s*.3);ctx.lineTo(s*.75,-s*.3);ctx.moveTo(-s*.75,s*.3);ctx.lineTo(s*.75,s*.3);ctx.stroke();ctx.fillStyle="#555";ctx.fillRect(-s*.85,-s*.5,s*.14,s);ctx.fillRect(s*.71,-s*.5,s*.14,s);ctx.restore()}

window.GARDEN={plan,render,fountain,lantern,chest,pedestal,gate,themes:THEMES,rng};
})();
