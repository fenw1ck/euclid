/* Items: things the player can pick up and keep in the inventory. Needs core.js (and tools.js for the axes,
   containers.js for the chest). Research: research/objects/items/ (Items category: coins, treasure, clothing, scrolls, potions).

   ITEMART.draw(ctx, key, x, y, size, o)   one item resting on (x, y) (the middle of its base), size = its height in px
     key   an item id from the game (e.g. 'chalice', 'necklace-lapis', 'scroll-angles') or a kind ('coin', 'scroll'…);
           ids are matched by their longest known prefix, so 'cape-indigo' draws a cape in indigo
     o     seed; state (coins: 'fresh' | 'worn' | 'rusty' | 'muddy'); metal (coins: 'gold' | 'silver' | 'bronze')
   ITEMART.coin(ctx, x, y, r, o)          one coin, centred on (x, y), radius r: beaded rim, a legend round the edge, a crest
   ITEMART.coins(ctx, x, y, size, n, o)   a small heap of n coins (for chests and drops)
   o.ribbon       scrolls: the ribbon's colour (each game scroll has its own; otherwise the seed picks one)
   ITEMART.has(key)                        true when there is a drawing for it
   Light from the upper left; outlines are a darker shade of the local colour, never black. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('items.js needs core.js loaded first');
const {mix,lighten,darken,rngMulberry}=A;
const TAU=Math.PI*2;
const METAL={gold:'#d4a73a',silver:'#c9ccd0',bronze:'#b07a35',iron:'#7a7470'};
function shade(ctx,x0,y0,x1,y1,c,k){const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,lighten(c,k||.3));g.addColorStop(.55,c);g.addColorStop(1,darken(c,k||.35));return g}
function out(ctx,c,w){ctx.strokeStyle=darken(c,.5);ctx.lineWidth=w;ctx.stroke()}
function shadow(ctx,w){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,0,w*.5,w*.08,0,0,TAU);ctx.fill()}

/* ---- coins: flan, beaded rim (a ring repeat), a legend of letters round the edge, a crest in the field ---- */
const LEGEND='ΕΥΚΛΕΙΔΟΥ·ΣΤΟΙΧΕΙΑ·';
function coin(ctx,x,y,r,o){o=o||{};const R=rngMulberry((o.seed||1)*131+7),metal=o.metal||'gold',st=o.state||'fresh',base=METAL[metal]||METAL.gold,lw=Math.max(.6,r*.05);
  const wear=st==='worn'?.65:st==='fresh'?0:.35; /* how much of the relief is rubbed away */
  ctx.save();ctx.translate(x,y);
  ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,rr=r*(1+(R()-.5)*.06);ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath(); /* hand-struck flans are never quite round */
  ctx.fillStyle=shade(ctx,-r,-r,r,r,base,.35);ctx.fill();out(ctx,base,lw);
  ctx.save();ctx.clip();
  const relief=a=>`rgba(${a<0?'255,250,230':'60,40,10'},${Math.abs(a)*(1-wear)})`;
  /* beading: dots round the rim */
  if(r>5)for(let i=0;i<28;i++){const a=i/28*TAU;ctx.fillStyle=relief(-.55);ctx.beginPath();ctx.arc(Math.cos(a)*r*.86,Math.sin(a)*r*.86,r*.045,0,TAU);ctx.fill()}
  /* the legend: letters round the edge (only marks at small sizes) */
  if(r>14){ctx.font=`600 ${r*.17}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<LEGEND.length;i++){const a=-Math.PI/2+i/LEGEND.length*TAU;ctx.save();ctx.rotate(a+Math.PI/2);ctx.fillStyle=relief(.45);ctx.fillText(LEGEND[i],0,-r*.68);ctx.restore()}}
  else if(r>6){ctx.strokeStyle=relief(.4);ctx.lineWidth=r*.05;ctx.setLineDash([r*.08,r*.06]);ctx.beginPath();ctx.arc(0,0,r*.68,0,TAU);ctx.stroke();ctx.setLineDash([])}
  /* the crest: a triangle in a circle (the Signet Ring's seal), raised */
  ctx.strokeStyle=relief(.5);ctx.lineWidth=Math.max(.6,r*.07);ctx.beginPath();ctx.arc(0,0,r*.42,0,TAU);ctx.stroke();
  ctx.beginPath();for(let i=0;i<3;i++){const a=-Math.PI/2+i*TAU/3;ctx.lineTo(Math.cos(a)*r*.38,Math.sin(a)*r*.38)}ctx.closePath();ctx.stroke();
  ctx.fillStyle=relief(-.4);ctx.beginPath();ctx.arc(-r*.25,-r*.3,r*.12,0,TAU);ctx.fill();
  /* wear, corrosion and mud */
  if(st==='worn'){const g=ctx.createRadialGradient(-r*.2,-r*.2,0,0,0,r);g.addColorStop(0,'rgba(255,250,230,.35)');g.addColorStop(1,'rgba(255,250,230,0)');ctx.fillStyle=g;ctx.fillRect(-r,-r,2*r,2*r)}
  if(st==='rusty'){const c=metal==='bronze'?'60,140,110':metal==='silver'?'40,38,45':metal==='iron'?'150,70,30':'120,95,50'; /* verdigris, black toning, rust; gold only dulls */
    for(let i=0;i<(metal==='gold'?10:30);i++){ctx.fillStyle=`rgba(${c},${.25+R()*.45})`;ctx.beginPath();ctx.arc((R()-.5)*1.8*r,(R()-.5)*1.8*r,r*(.06+R()*.22),0,TAU);ctx.fill()}}
  if(st==='muddy'){for(let i=0;i<12;i++){ctx.fillStyle=`rgba(${90+R()*30},${66+R()*20},${40+R()*15},${.55+R()*.35})`;ctx.beginPath();ctx.ellipse((R()-.3)*1.6*r,(R()-.2)*1.6*r,r*(.15+R()*.35),r*(.1+R()*.2),R()*3,0,TAU);ctx.fill()}}
  ctx.restore();ctx.restore()}
function coins(ctx,x,y,size,n,o){o=o||{};const R=rngMulberry((o.seed||1)*17+3),r=size*.3;ctx.save();ctx.translate(x,y);shadow(ctx,size*1.2);
  for(let i=0;i<n;i++){const k=i/Math.max(1,n-1),cx=(R()-.5)*size*.7*(1-k*.6),cy=-r*.35-k*size*.45;ctx.save();ctx.translate(cx,cy);ctx.scale(1,.45+R()*.2);
    coin(ctx,0,0,r,{metal:o.metal||(R()<.25?'silver':'gold'),state:o.state||(R()<.3?'worn':'fresh'),seed:(o.seed||1)*7+i});ctx.restore()}ctx.restore()}

/* ---- the other items, each in a 1 x 1 box: x from -.5 to .5, y from 0 (resting) up to -1 ---- */
const D={};
D.necklace=(ctx,o)=>{const torc=/gold|torc/.test(o.id||''),c=torc?METAL.gold:'#8a6a4a';ctx.strokeStyle=shade(ctx,-.5,-1,.5,0,c);ctx.lineWidth=torc?.09:.04;ctx.beginPath();ctx.ellipse(0,-.55,.38,.32,0,Math.PI*(torc?.1:0),Math.PI*(torc?1.9:2));ctx.stroke();
  if(torc){for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*.12,-.25,.06,0,TAU);ctx.fillStyle=shade(ctx,-.2,-.3,.2,-.2,c);ctx.fill()}}
  else{ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;ctx.lineTo(Math.cos(a)*.14,-.2+Math.sin(a)*.14)}ctx.closePath();ctx.fillStyle=shade(ctx,-.14,-.34,.14,-.06,'#2f5fb0');ctx.fill();out(ctx,'#2f5fb0',.015);ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(-.05,-.25,.03,0,TAU);ctx.fill()}};
D.sword=(ctx,o)=>{const star=/star/.test(o.id||''),bl=star?'#2b3754':METAL.bronze;ctx.save();ctx.rotate(-.5);ctx.translate(.12,0);
  ctx.beginPath();ctx.moveTo(-.045,-.3);ctx.lineTo(-.04,-1.05);ctx.lineTo(0,-1.15);ctx.lineTo(.04,-1.05);ctx.lineTo(.045,-.3);ctx.closePath();ctx.fillStyle=shade(ctx,-.05,0,.05,0,bl,.4);ctx.fill();out(ctx,bl,.012);
  ctx.strokeStyle=star?'#d8ecff':lighten(bl,.4);ctx.lineWidth=.01;ctx.beginPath();ctx.moveTo(0,-.32);ctx.lineTo(0,-1.1);ctx.stroke();
  ctx.fillStyle=METAL.gold;ctx.fillRect(-.16,-.32,.32,.05);ctx.fillStyle='#5a3820';ctx.fillRect(-.03,-.27,.06,.2);ctx.fillStyle=METAL.gold;ctx.beginPath();ctx.arc(0,-.05,.045,0,TAU);ctx.fill();ctx.restore()};
D.cape=(ctx,o)=>{const star=/constellation/.test(o.id||''),c=star?'#1f2650':'#3a3f8a';ctx.beginPath();ctx.moveTo(-.18,-.95);ctx.quadraticCurveTo(-.5,-.5,-.48,-.02);ctx.quadraticCurveTo(0,.04,.48,-.02);ctx.quadraticCurveTo(.5,-.5,.18,-.95);ctx.closePath();ctx.fillStyle=shade(ctx,-.5,-1,.5,0,c,.25);ctx.fill();out(ctx,c,.015);
  ctx.strokeStyle=darken(c,.3);ctx.lineWidth=.012;for(const x of[-.2,0,.2]){ctx.beginPath();ctx.moveTo(x*.4,-.9);ctx.quadraticCurveTo(x,-.5,x*1.6,-.03);ctx.stroke()}
  ctx.fillStyle=METAL.gold;ctx.beginPath();ctx.arc(0,-.93,.05,0,TAU);ctx.fill();
  if(star){const R=rngMulberry(5);ctx.fillStyle='#f2e6a0';ctx.strokeStyle='rgba(242,230,160,.5)';ctx.lineWidth=.006;let p=null;for(let i=0;i<14;i++){const q=[(R()-.5)*.7,-.1-R()*.75];ctx.beginPath();ctx.arc(q[0],q[1],.012,0,TAU);ctx.fill();if(p&&R()<.6){ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.stroke()}p=q}}};
D.gloves=(ctx,o)=>{const gild=/gild/.test(o.id||''),c=gild?METAL.gold:'#e8dfc8';for(const s of[-1,1]){ctx.save();ctx.translate(s*.2,0);ctx.scale(s,1);ctx.beginPath();ctx.moveTo(-.12,0);ctx.lineTo(-.13,-.45);
  for(let f=0;f<4;f++){const fx=-.12+f*.075;ctx.lineTo(fx,-.62-(f===1||f===2?.08:0));ctx.lineTo(fx+.06,-.62-(f===1||f===2?.08:0));ctx.lineTo(fx+.065,-.45)}ctx.lineTo(.2,-.32);ctx.lineTo(.12,-.2);ctx.lineTo(.12,0);ctx.closePath();ctx.fillStyle=shade(ctx,-.15,-.7,.2,0,c,.25);ctx.fill();out(ctx,c,.012);ctx.restore()}};
D.crown=(ctx,o)=>{const laurel=/laurel/.test(o.id||'');if(laurel){ctx.strokeStyle='#7a6a2a';ctx.lineWidth=.03;ctx.beginPath();ctx.ellipse(0,-.4,.4,.3,0,.3,Math.PI*2-.3+Math.PI*0);ctx.stroke();
    for(let i=0;i<16;i++){const a=.35+i/16*(TAU-.7),x=Math.cos(a+Math.PI/2)*.4,y=-.4+Math.sin(a+Math.PI/2)*.3;ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI);ctx.fillStyle=i%2?'#5f7a2f':'#7a9a3a';ctx.beginPath();ctx.ellipse(.05,0,.07,.025,.5,0,TAU);ctx.fill();ctx.restore()}return}
  const c=METAL.gold;ctx.beginPath();ctx.moveTo(-.4,0);ctx.lineTo(-.4,-.45);for(let i=0;i<5;i++){const x=-.4+(i+.5)*.16;ctx.lineTo(x,-.8);ctx.lineTo(x+.08,-.45)}ctx.lineTo(.4,0);ctx.closePath();ctx.fillStyle=shade(ctx,-.4,-.8,.4,0,c);ctx.fill();out(ctx,c,.015);
  const gems=['#c0392b','#2f5fb0','#2f8a4a','#7a2f9a','#e0b030'];for(let i=0;i<5;i++){ctx.fillStyle=gems[i];ctx.beginPath();ctx.arc(-.4+(i+.5)*.16,-.2,.035,0,TAU);ctx.fill()}};
D.chalice=(ctx)=>{const c=METAL.silver;ctx.beginPath();ctx.moveTo(-.3,-.95);ctx.quadraticCurveTo(-.3,-.5,-.05,-.45);ctx.lineTo(-.04,-.12);ctx.quadraticCurveTo(-.25,-.06,-.25,0);ctx.lineTo(.25,0);ctx.quadraticCurveTo(.25,-.06,.04,-.12);ctx.lineTo(.05,-.45);ctx.quadraticCurveTo(.3,-.5,.3,-.95);ctx.closePath();ctx.fillStyle=shade(ctx,-.3,0,.3,0,c,.4);ctx.fill();out(ctx,c,.015);ctx.fillStyle=darken(c,.4);ctx.beginPath();ctx.ellipse(0,-.95,.3,.05,0,0,TAU);ctx.fill()};
D.astrolabe=(ctx)=>{const c='#c9a03a';ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-1.0,.06,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(0,-.5,.42,0,TAU);ctx.fillStyle=shade(ctx,-.4,-.9,.4,-.1,c);ctx.fill();out(ctx,c,.015);
  ctx.strokeStyle=darken(c,.4);ctx.lineWidth=.01;for(let i=0;i<48;i++){const a=i/48*TAU,r1=i%4?.37:.33;ctx.beginPath();ctx.moveTo(Math.cos(a)*.4,-.5+Math.sin(a)*.4);ctx.lineTo(Math.cos(a)*r1,-.5+Math.sin(a)*r1);ctx.stroke()} /* the scale: a ring repeat */
  ctx.beginPath();ctx.arc(0,-.5,.28,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(.05,-.55,.18,0,TAU);ctx.stroke();ctx.lineWidth=.02;ctx.beginPath();ctx.moveTo(-.3,-.32);ctx.lineTo(.3,-.68);ctx.stroke();ctx.fillStyle=darken(c,.4);ctx.beginPath();ctx.arc(0,-.5,.03,0,TAU);ctx.fill()};
D.compass=(ctx)=>{const c=METAL.iron;ctx.lineCap='round';ctx.strokeStyle=shade(ctx,-.3,-1,.3,0,c);ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(0,-.9);ctx.lineTo(-.28,0);ctx.moveTo(0,-.9);ctx.lineTo(.28,0);ctx.stroke();ctx.fillStyle=lighten(c,.2);ctx.beginPath();ctx.arc(0,-.9,.07,0,TAU);ctx.fill();ctx.fillRect(-.015,-1.02,.03,.1)};
D.straightedge=(ctx)=>{ctx.save();ctx.rotate(-.12);ctx.fillStyle=shade(ctx,0,-.2,0,0,'#2a1e18',.3);ctx.fillRect(-.5,-.14,1,.1);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(-.5,-.14,1,.02);ctx.restore()};
D.lyre=(ctx)=>{const c='#7a4a2a';ctx.strokeStyle=shade(ctx,-.4,-1,.4,0,c);ctx.lineWidth=.07;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-.25,-.95);ctx.quadraticCurveTo(-.45,-.4,-.15,-.1);ctx.moveTo(.25,-.95);ctx.quadraticCurveTo(.45,-.4,.15,-.1);ctx.stroke();
  ctx.fillStyle='#a8722e';ctx.beginPath();ctx.ellipse(0,-.12,.2,.12,0,0,TAU);ctx.fill();ctx.fillStyle=c;ctx.fillRect(-.3,-.92,.6,.05);ctx.strokeStyle='#efe6c8';ctx.lineWidth=.008;for(let i=0;i<7;i++){const x=-.12+i*.04;ctx.beginPath();ctx.moveTo(x,-.88);ctx.lineTo(x*.8,-.15);ctx.stroke()}};
D.tile=(ctx)=>{ctx.fillStyle='#d9cdb0';ctx.fillRect(-.35,-.4,.7,.38);ctx.fillStyle='#2f5fb0';ctx.beginPath();ctx.moveTo(-.25,-.08);ctx.lineTo(.25,-.08);ctx.lineTo(0,-.36);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=.01;for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(-.35+i*.14,-.4);ctx.lineTo(-.35+i*.14,-.02);ctx.stroke()}};
D.amphora=(ctx)=>{const c='#c0693a';ctx.beginPath();ctx.moveTo(-.08,-.98);ctx.lineTo(-.1,-.82);ctx.quadraticCurveTo(-.4,-.7,-.3,-.3);ctx.quadraticCurveTo(-.18,-.05,0,0);ctx.quadraticCurveTo(.18,-.05,.3,-.3);ctx.quadraticCurveTo(.4,-.7,.1,-.82);ctx.lineTo(.08,-.98);ctx.closePath();ctx.fillStyle=shade(ctx,-.35,0,.35,0,c,.3);ctx.fill();out(ctx,c,.015);
  ctx.strokeStyle=c;ctx.lineWidth=.035;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*.09,-.9);ctx.quadraticCurveTo(s*.32,-.92,s*.27,-.68);ctx.stroke()}
  ctx.fillStyle='#1d1612';ctx.fillRect(-.33,-.55,.66,.14);ctx.strokeStyle=c;ctx.lineWidth=.012;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-.22+i*.15,-.48,.04,0,TAU);ctx.stroke()}};
D.lamp=(ctx)=>{const c=METAL.bronze;ctx.beginPath();ctx.ellipse(-.05,-.15,.3,.14,0,0,TAU);ctx.fillStyle=shade(ctx,-.35,-.3,.3,0,c);ctx.fill();ctx.beginPath();ctx.moveTo(.18,-.2);ctx.lineTo(.45,-.22);ctx.lineTo(.45,-.14);ctx.lineTo(.18,-.08);ctx.fill();out(ctx,c,.012);
  ctx.strokeStyle=c;ctx.lineWidth=.04;ctx.beginPath();ctx.arc(-.38,-.18,.08,1.2,5);ctx.stroke();ctx.fillStyle='#2a1e14';ctx.beginPath();ctx.arc(-.05,-.22,.04,0,TAU);ctx.fill()};
D.ring=(ctx)=>{const c=METAL.gold;ctx.strokeStyle=shade(ctx,-.3,-.6,.3,0,c);ctx.lineWidth=.08;ctx.beginPath();ctx.ellipse(0,-.3,.25,.22,0,0,TAU);ctx.stroke();ctx.fillStyle=shade(ctx,-.15,-.75,.15,-.45,c);ctx.beginPath();ctx.ellipse(0,-.55,.16,.12,0,0,TAU);ctx.fill();
  ctx.strokeStyle=darken(c,.45);ctx.lineWidth=.012;ctx.strokeRect(-.09,-.62,.18,.14);ctx.beginPath();ctx.arc(0,-.55,.06,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-.6);ctx.lineTo(.05,-.52);ctx.lineTo(-.05,-.52);ctx.closePath();ctx.stroke()};
D.map=(ctx)=>{const c='#e2cf9c';ctx.fillStyle=shade(ctx,-.4,-.8,.4,0,c,.15);ctx.beginPath();ctx.moveTo(-.42,-.05);ctx.lineTo(-.4,-.75);ctx.lineTo(.42,-.72);ctx.lineTo(.4,-.04);ctx.closePath();ctx.fill();out(ctx,c,.012);
  ctx.strokeStyle='#7a5a32';ctx.lineWidth=.012;ctx.strokeRect(-.3,-.62,.2,.18);ctx.strokeRect(.05,-.62,.25,.14);ctx.strokeRect(-.2,-.35,.45,.2);ctx.setLineDash([.03,.03]);ctx.beginPath();ctx.moveTo(-.1,-.53);ctx.lineTo(.05,-.55);ctx.moveTo(-.2,-.44);ctx.lineTo(-.15,-.35);ctx.stroke();ctx.setLineDash([])};
D.bust=(ctx)=>{const c='#e6e1d8';ctx.fillStyle=shade(ctx,-.35,-1,.35,0,c,.2);ctx.beginPath();ctx.moveTo(-.38,0);ctx.quadraticCurveTo(-.36,-.3,-.15,-.35);ctx.lineTo(-.14,-.45);ctx.quadraticCurveTo(-.25,-.6,-.2,-.8);ctx.quadraticCurveTo(-.1,-1,.06,-.98);ctx.quadraticCurveTo(.24,-.92,.22,-.7);ctx.lineTo(.27,-.62);ctx.lineTo(.21,-.58);ctx.quadraticCurveTo(.2,-.45,.12,-.42);ctx.lineTo(.14,-.35);ctx.quadraticCurveTo(.36,-.3,.38,0);ctx.closePath();ctx.fill();out(ctx,c,.012);
  ctx.fillStyle='rgba(120,110,100,.35)';ctx.beginPath();ctx.ellipse(0,-.48,.16,.08,0,0,TAU);ctx.fill();ctx.fillStyle=darken(c,.25);ctx.beginPath();ctx.moveTo(.24,-.66);ctx.lineTo(.28,-.62);ctx.lineTo(.22,-.6);ctx.fill()}; /* the beard, and the chipped nose */
D.hourglass=(ctx)=>{const w='#6a4a2a';ctx.fillStyle=w;ctx.fillRect(-.3,-1,.6,.07);ctx.fillRect(-.3,-.07,.6,.07);ctx.fillRect(-.27,-.95,.04,.9);ctx.fillRect(.23,-.95,.04,.9);
  ctx.fillStyle='rgba(200,230,240,.35)';ctx.beginPath();ctx.moveTo(-.18,-.93);ctx.quadraticCurveTo(-.18,-.6,0,-.5);ctx.quadraticCurveTo(-.18,-.4,-.18,-.07);ctx.lineTo(.18,-.07);ctx.quadraticCurveTo(.18,-.4,0,-.5);ctx.quadraticCurveTo(.18,-.6,.18,-.93);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d9b66a';ctx.beginPath();ctx.moveTo(-.12,-.75);ctx.quadraticCurveTo(0,-.6,.12,-.75);ctx.quadraticCurveTo(0,-.62,0,-.52);ctx.fill();ctx.beginPath();ctx.moveTo(-.16,-.07);ctx.lineTo(0,-.26);ctx.lineTo(.16,-.07);ctx.fill();ctx.fillRect(-.006,-.5,.012,.24)};
/* scroll: an antiqued roll of papyrus lying on its side: fibre cross-hatching, spiral ends, foxing and darker edges,
   tied at the middle with a ribbon (its colour varies) and a wax seal on the tie. Research: research/objects/items/scroll.md */
const RIBBONS={'scroll-circles':'#b3262e','scroll-lines':'#2f5fb0','scroll-angles':'#2f8a4a','scroll-parallels':'#6a3a9a','scroll-areas':'#c99a2e','scroll-squares':'#1f1f26'};
const RIBPAL=['#b3262e','#2f5fb0','#2f8a4a','#6a3a9a','#c99a2e','#1f1f26','#c0632a','#2a8a8a'];
D.scroll=(ctx,o)=>{const R=rngMulberry((o.seed||1)*53+9),rib=o.ribbon||RIBBONS[o.id]||RIBPAL[Math.floor(R()*RIBPAL.length)],paper='#d8c08a',L=.9,rr=.15,cy=-rr;
  /* the roll's body */
  ctx.save();ctx.beginPath();ctx.rect(-L/2,cy-rr,L,2*rr);ctx.fillStyle=shade(ctx,0,cy-rr,0,cy+rr,paper,.35);ctx.fill();ctx.clip();
  ctx.strokeStyle='rgba(120,90,40,.18)';ctx.lineWidth=.006;for(let i=0;i<14;i++){const y=cy-rr+i*2*rr/14;ctx.beginPath();ctx.moveTo(-L/2,y);ctx.lineTo(L/2,y);ctx.stroke()}for(let i=0;i<22;i++){const x=-L/2+i*L/22;ctx.beginPath();ctx.moveTo(x,cy-rr);ctx.lineTo(x,cy+rr);ctx.stroke()} /* the pith's cross-hatching */
  for(let i=0;i<10;i++){ctx.fillStyle=`rgba(${110+R()*30},${70+R()*20},${30},${.12+R()*.2})`;ctx.beginPath();ctx.ellipse((R()-.5)*L,cy+(R()-.5)*1.6*rr,.02+R()*.05,.01+R()*.03,R()*3,0,TAU);ctx.fill()} /* foxing */
  const eg=ctx.createLinearGradient(-L/2,0,L/2,0);eg.addColorStop(0,'rgba(90,60,25,.45)');eg.addColorStop(.12,'rgba(90,60,25,0)');eg.addColorStop(.88,'rgba(90,60,25,0)');eg.addColorStop(1,'rgba(90,60,25,.45)');ctx.fillStyle=eg;ctx.fillRect(-L/2,cy-rr,L,2*rr);
  ctx.restore();
  /* the outer sheet's loose edge along the top, a little torn */
  ctx.strokeStyle=darken(paper,.35);ctx.lineWidth=.008;ctx.beginPath();for(let i=0;i<=16;i++){const x=-L/2+i*L/16;ctx.lineTo(x,cy-rr*.2+(i%3===1?.008:0))}ctx.stroke();
  /* the two ends: the spiral of rolled layers */
  for(const s of[-1,1]){const ex=s*L/2;ctx.fillStyle=lighten(paper,.1);ctx.beginPath();ctx.ellipse(ex,cy,rr*.35,rr,0,0,TAU);ctx.fill();ctx.strokeStyle=darken(paper,.3);ctx.lineWidth=.006;ctx.stroke();
    ctx.beginPath();for(let a=0;a<6*Math.PI;a+=.2){const k=1-a/(6*Math.PI);ctx.lineTo(ex+Math.cos(a)*rr*.33*k,cy+Math.sin(a)*rr*.92*k)}ctx.stroke()}
  ctx.strokeStyle=darken(paper,.45);ctx.lineWidth=.01;ctx.strokeRect(-L/2,cy-rr,L,2*rr);
  /* the ribbon: a band round the roll, a bow, two tails; and the seal */
  const rx=.05;ctx.fillStyle=shade(ctx,rx-.04,cy-rr,rx+.04,cy+rr,rib,.3);ctx.fillRect(rx-.035,cy-rr-.005,.07,2*rr+.01);
  ctx.fillStyle=rib;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(rx,cy-rr*.2);ctx.quadraticCurveTo(rx+s*.16,cy-rr*1.3,rx+s*.13,cy+rr*.05);ctx.closePath();ctx.fill()} /* the bow's loops */
  for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(rx-.01,cy);ctx.quadraticCurveTo(rx+s*.06,cy+rr*1.2,rx+s*.12,cy+rr*1.05);ctx.lineTo(rx+s*.1,cy+rr*1.25);ctx.quadraticCurveTo(rx+s*.03,cy+rr*1.3,rx+.01,cy+.01);ctx.fill()} /* tails */
  ctx.fillStyle=darken(rib,.25);ctx.beginPath();ctx.arc(rx,cy-rr*.05,.03,0,TAU);ctx.fill(); /* the knot */
  ctx.fillStyle=shade(ctx,rx-.05,cy,rx+.05,cy+.1,'#8a1f1a',.3);ctx.beginPath();ctx.arc(rx+.015,cy+rr*.55,.045,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,220,200,.35)';ctx.lineWidth=.006;ctx.beginPath();ctx.moveTo(rx-.005,cy+rr*.7);ctx.lineTo(rx+.015,cy+rr*.35);ctx.lineTo(rx+.035,cy+rr*.7);ctx.closePath();ctx.stroke(); /* the wax seal, with the triangle */
};
/* clothing (research/objects/items/clothing/): boots in three speed upgrades, from the krepides (strapped sandals)
   through the endromis (a short hunting boot) to the talaria (Hermes' winged sandals); greaves; a chiton; trousers */
function foot(ctx,o,dx,back){const id=o.id||'',L='#8a5a32',dk=darken(L,.35);ctx.save();ctx.translate(dx,0);if(back)ctx.globalAlpha=.85;
  if(/greaves/.test(id)){const c=METAL.bronze;ctx.beginPath();ctx.moveTo(-.12,-.05);ctx.quadraticCurveTo(-.17,-.5,-.1,-.95);ctx.lineTo(.1,-.95);ctx.quadraticCurveTo(.17,-.5,.12,-.05);ctx.closePath();ctx.fillStyle=shade(ctx,-.15,0,.15,0,c,.4);ctx.fill();out(ctx,c,.012);
    ctx.strokeStyle=darken(c,.35);ctx.lineWidth=.01;for(let i=0;i<4;i++){const y=-.25-i*.17,w=.04+i*.025;ctx.strokeRect(-w,y,2*w,.06)}ctx.restore();return} /* etched with a staircase of squares */
  const winged=/winged/.test(id),boot=/wayfarer/.test(id),sole=winged?METAL.gold:'#5a3a22';
  ctx.fillStyle=sole;ctx.beginPath();ctx.moveTo(-.2,0);ctx.lineTo(.22,0);ctx.quadraticCurveTo(.27,-.02,.22,-.05);ctx.lineTo(-.2,-.05);ctx.closePath();ctx.fill(); /* the sole */
  if(boot){ctx.beginPath();ctx.moveTo(-.18,-.05);ctx.lineTo(-.16,-.62);ctx.lineTo(.02,-.64);ctx.lineTo(.03,-.3);ctx.quadraticCurveTo(.2,-.2,.22,-.05);ctx.closePath();ctx.fillStyle=shade(ctx,-.2,-.6,.2,0,L,.3);ctx.fill();out(ctx,L,.012);
    ctx.fillStyle=lighten(L,.15);ctx.beginPath();ctx.moveTo(-.02,-.6);ctx.lineTo(.1,-.68);ctx.lineTo(.06,-.32);ctx.closePath();ctx.fill(); /* the long tongue */
    ctx.strokeStyle='#e6d3a8';ctx.lineWidth=.012;for(let i=0;i<5;i++){const y=-.33-i*.06;ctx.beginPath();ctx.moveTo(-.01,y);ctx.lineTo(.05,y-.03);ctx.stroke()}
    ctx.fillStyle=darken(L,.2);ctx.fillRect(-.18,-.66,.21,.05)} /* the turned cuff */
  else{const st=winged?METAL.gold:L;ctx.fillStyle='rgba(225,190,160,.55)';ctx.beginPath();ctx.moveTo(-.16,-.05);ctx.quadraticCurveTo(-.17,-.4,-.1,-.62);ctx.lineTo(.02,-.62);ctx.lineTo(.03,-.25);ctx.quadraticCurveTo(.2,-.15,.22,-.05);ctx.closePath();ctx.fill(); /* the foot, faintly */
    ctx.strokeStyle=st;ctx.lineWidth=.028;ctx.lineCap='round';for(let i=0;i<5;i++){const y=-.08-i*.11;ctx.beginPath();ctx.moveTo(-.15,y);ctx.lineTo(i<2?.18-i*.08:.03,y-.07);ctx.stroke();if(i>1){ctx.beginPath();ctx.moveTo(.03,y);ctx.lineTo(-.14,y-.07);ctx.stroke()}} /* crisscrossing straps */
    if(winged){ctx.fillStyle='#f4efe2';for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(-.22-k*.03,-.5+k*.04,.15-.02*k,.035,-.5+k*.15,0,TAU);ctx.fill();ctx.strokeStyle='rgba(120,100,60,.85)';ctx.lineWidth=.008;ctx.stroke()}}} /* the wings at the ankle */
  ctx.restore()}
D.boots=(ctx,o)=>{foot(ctx,o,.12,true);foot(ctx,o,-.08,false)};
D.shirt=(ctx)=>{const c='#efe6d0';ctx.beginPath();ctx.moveTo(-.2,-.95);ctx.lineTo(-.45,-.8);ctx.lineTo(-.4,-.6);ctx.lineTo(-.25,-.65);ctx.lineTo(-.28,0);ctx.lineTo(.28,0);ctx.lineTo(.25,-.65);ctx.lineTo(.4,-.6);ctx.lineTo(.45,-.8);ctx.lineTo(.2,-.95);ctx.quadraticCurveTo(0,-.85,-.2,-.95);ctx.closePath();ctx.fillStyle=shade(ctx,-.4,-1,.4,0,c,.2);ctx.fill();out(ctx,c,.012);
  ctx.strokeStyle='rgba(120,100,70,.35)';ctx.lineWidth=.008;for(const x of[-.12,0,.12]){ctx.beginPath();ctx.moveTo(x*.8,-.8);ctx.lineTo(x*1.4,-.02);ctx.stroke()}ctx.strokeStyle='#2f5fb0';ctx.lineWidth=.03;ctx.beginPath();ctx.moveTo(-.28,-.06);ctx.lineTo(.28,-.06);ctx.stroke()}; /* a linen chiton with a blue border */
D.pants=(ctx)=>{const c='#6a5a48';ctx.beginPath();ctx.moveTo(-.25,-.95);ctx.lineTo(.25,-.95);ctx.lineTo(.27,0);ctx.lineTo(.06,0);ctx.lineTo(0,-.6);ctx.lineTo(-.06,0);ctx.lineTo(-.27,0);ctx.closePath();ctx.fillStyle=shade(ctx,-.3,-1,.3,0,c,.25);ctx.fill();out(ctx,c,.012);ctx.fillStyle=darken(c,.2);ctx.fillRect(-.25,-.95,.5,.06)};
/* potions (research/objects/items/potions/): single-use. A round-bottomed sphere flask, a short stem stopped with a cork,
   and the fluid's colour shows its strength. Weed killer: weak (pale green), strong (green), strongest (deep green, glowing). */
const POTION={weak:'#c3d86a',strong:'#45a84e',strongest:'#1d6b3c'};
D.potion=(ctx,o)=>{const id=o.id||'',st=/strongest/.test(id)?'strongest':/strong/.test(id)?'strong':'weak',fl=o.fluid||POTION[st],R=.36,cy=-R-.02,lvl=o.level==null?.62:o.level;
  if(st==='strongest'){const g=ctx.createRadialGradient(0,cy,0,0,cy,R*1.7);g.addColorStop(0,'rgba(120,255,170,.35)');g.addColorStop(1,'rgba(120,255,170,0)');ctx.fillStyle=g;ctx.fillRect(-R*1.7,cy-R*1.7,R*3.4,R*3.4)}
  ctx.save();ctx.beginPath();ctx.arc(0,cy,R,0,TAU);ctx.clip(); /* the fluid, up to its level, with a lighter meniscus */
  const top=cy+R-2*R*lvl;ctx.fillStyle=shade(ctx,-R,top,R,cy+R,fl,.3);ctx.fillRect(-R,top,2*R,2*R);ctx.fillStyle=lighten(fl,.3);ctx.beginPath();ctx.ellipse(0,top,R*.95,.03,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<5;i++){const bx=Math.sin(i*2.3+(o.seed||0))*R*.5,by=cy+R*.5-i*.07;if(by>top)ctx.beginPath(),ctx.arc(bx,by,.012+.006*(i%2),0,TAU),ctx.fill()}ctx.restore();
  ctx.beginPath();ctx.moveTo(-.07,cy-R*.94);ctx.lineTo(-.07,cy-R-.2);ctx.lineTo(.07,cy-R-.2);ctx.lineTo(.07,cy-R*.94);ctx.fillStyle='rgba(225,240,235,.22)';ctx.fill(); /* the stem */
  ctx.beginPath();ctx.arc(0,cy,R,0,TAU);ctx.fillStyle='rgba(225,240,235,.12)';ctx.fill();ctx.strokeStyle='rgba(60,80,80,.75)';ctx.lineWidth=.014;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-.07,cy-R*.94);ctx.lineTo(-.07,cy-R-.2);ctx.moveTo(.07,cy-R*.94);ctx.lineTo(.07,cy-R-.2);ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,cy-R-.2,.095,.025,0,0,TAU);ctx.stroke(); /* the lip */
  const ck='#b98a52';ctx.beginPath();ctx.moveTo(-.075,cy-R-.17);ctx.lineTo(-.09,cy-R-.32);ctx.lineTo(.09,cy-R-.32);ctx.lineTo(.075,cy-R-.17);ctx.closePath();ctx.fillStyle=shade(ctx,-.09,0,.09,0,ck,.3);ctx.fill();out(ctx,ck,.01);
  ctx.fillStyle=darken(ck,.3);for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-.05+i*.033,cy-R-.24-(i%2)*.04,.008,0,TAU);ctx.fill()} /* cork pores */
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.025;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,cy,R*.78,Math.PI*1.08,Math.PI*1.38);ctx.stroke(); /* the highlight, upper left */
  const tg='#efe3c2';ctx.strokeStyle='#8a6a3a';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(.07,cy-R-.12);ctx.lineTo(.2,cy-R+.02);ctx.stroke(); /* the paper tag: one, two or three leaves for its strength */
  ctx.save();ctx.translate(.24,cy-R+.08);ctx.rotate(.25);ctx.fillStyle=tg;ctx.fillRect(-.07,-.05,.14,.11);ctx.strokeRect(-.07,-.05,.14,.11);const n=st==='weak'?1:st==='strong'?2:3;ctx.fillStyle='#3a7a3a';
  for(let i=0;i<n;i++){ctx.beginPath();ctx.ellipse(-.035*(n-1)+i*.035,0,.012,.028,.4,0,TAU);ctx.fill()}ctx.strokeStyle='#8a2a2a';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(-.06,.045);ctx.lineTo(.06,-.04);ctx.stroke();ctx.restore()};
/* health potions (research/objects/items/potions/health-potion.md): drink to heal. The same round-bottomed sphere as
   the weed killer, but stoppered with a caduceus: a short rod rising from the cork, two snakes twined round it in
   opposite directions with their heads facing at the top, and a pair of wings above them. Strength shows three ways:
   the fluid (rose, red, deep crimson that glows), the caduceus metal (bronze, silver, gold) and how full the wings are.
   ids: health-minor | health-greater | health-supreme (o.level for how full). */
const HEAL={minor:{fl:'#e58a8a',m:'#b07a35',wing:2},greater:{fl:'#c8282e',m:'#c9ccd0',wing:3},supreme:{fl:'#7e0b22',m:'#d4a73a',wing:4}};
function caduceus(ctx,x,y0,h,m,nw){const top=y0-h,lw=Math.max(.008,h*.05);
  ctx.strokeStyle=darken(m,.35);ctx.lineWidth=lw*1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,top);ctx.stroke(); /* the rod */
  ctx.strokeStyle=lighten(m,.35);ctx.lineWidth=lw*.6;ctx.beginPath();ctx.moveTo(x-lw*.3,y0);ctx.lineTo(x-lw*.3,top);ctx.stroke();
  for(const s of[1,-1]){ /* two snakes, crossing three times, heads turned to face each other under the wings */
    ctx.beginPath();for(let i=0;i<=28;i++){const u=i/28,yy=y0-u*h*.78,xx=x+s*Math.sin(u*Math.PI*3)*h*.17*(1-.25*u);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}
    ctx.strokeStyle=darken(m,.45);ctx.lineWidth=lw*1.9;ctx.stroke();ctx.strokeStyle=m;ctx.lineWidth=lw*1.2;ctx.stroke();
    const hy=y0-h*.8;ctx.fillStyle=m;ctx.beginPath();ctx.ellipse(x+s*h*.09,hy,h*.06,h*.035,s*.3,0,TAU);ctx.fill();ctx.strokeStyle=darken(m,.45);ctx.lineWidth=lw*.5;ctx.stroke()}
  for(const s of[1,-1]){ /* the wings: spread out and up, nw primaries each side, longest on top, like Hermes' */
    const wy=top+h*.14;ctx.beginPath();ctx.moveTo(x,wy);ctx.quadraticCurveTo(x+s*h*.25,wy-h*.2,x+s*h*.52,wy-h*.26);ctx.quadraticCurveTo(x+s*h*.3,wy+h*.02,x,wy+h*.08);ctx.closePath();ctx.fillStyle=m;ctx.fill();ctx.strokeStyle=darken(m,.4);ctx.lineWidth=lw*.5;ctx.stroke(); /* the wing's arm */
    for(let k=0;k<nw;k++){const u=(k+1)/(nw+1),px=x+s*h*.5*u,py=wy-h*.24*u+h*.03,L=h*(.16+.1*u);ctx.save();ctx.translate(px,py);ctx.rotate(s*(.35+.5*(1-u)));
      ctx.beginPath();ctx.ellipse(0,L*.45,L*.13,L*.5,0,0,TAU);ctx.fillStyle=k%2?lighten(m,.25):lighten(m,.08);ctx.fill();ctx.strokeStyle=darken(m,.4);ctx.lineWidth=lw*.4;ctx.stroke();ctx.restore()}}
  ctx.beginPath();ctx.arc(x,top,h*.055,0,TAU);ctx.fillStyle=lighten(m,.25);ctx.fill();ctx.strokeStyle=darken(m,.4);ctx.lineWidth=lw*.5;ctx.stroke()} /* the knob */
D.health=(ctx,o)=>{ctx.save();ctx.scale(.86,.86);healthPotion(ctx,o);ctx.restore()}; /* scaled so the caduceus tip stays within the item's unit height */
function healthPotion(ctx,o){const id=o.id||'',st=/supreme/.test(id)?'supreme':/greater/.test(id)?'greater':'minor',P=HEAL[st],fl=o.fluid||P.fl,R=.3,cy=-R-.02,lvl=o.level==null?.72:o.level;
  if(st==='supreme'){const g=ctx.createRadialGradient(0,cy,0,0,cy,R*1.8);g.addColorStop(0,'rgba(255,120,120,.4)');g.addColorStop(1,'rgba(255,120,120,0)');ctx.fillStyle=g;ctx.fillRect(-R*1.8,cy-R*1.8,R*3.6,R*3.6)}
  ctx.save();ctx.beginPath();ctx.arc(0,cy,R,0,TAU);ctx.clip();const top=cy+R-2*R*lvl;
  const g=ctx.createRadialGradient(-R*.25,cy-R*.1,R*.1,0,cy,R*1.1);g.addColorStop(0,lighten(fl,.35));g.addColorStop(.6,fl);g.addColorStop(1,darken(fl,.4));ctx.fillStyle=g;ctx.fillRect(-R,top,2*R,2*R);
  ctx.fillStyle=lighten(fl,.4);ctx.beginPath();ctx.ellipse(0,top,R*.95,.028,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,235,235,.5)';for(let i=0;i<4;i++){const bx=Math.cos(i*1.9+(o.seed||0))*R*.45,by=cy+R*.55-i*.08;if(by>top)ctx.beginPath(),ctx.arc(bx,by,.011+.005*(i%2),0,TAU),ctx.fill()}ctx.restore();
  const nk=.065,nt=cy-R-.13;ctx.beginPath();ctx.moveTo(-nk,cy-R*.95);ctx.lineTo(-nk,nt);ctx.lineTo(nk,nt);ctx.lineTo(nk,cy-R*.95);ctx.fillStyle='rgba(225,240,235,.22)';ctx.fill(); /* the neck */
  ctx.beginPath();ctx.arc(0,cy,R,0,TAU);ctx.fillStyle='rgba(225,240,235,.1)';ctx.fill();ctx.strokeStyle='rgba(70,60,60,.75)';ctx.lineWidth=.013;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-nk,cy-R*.95);ctx.lineTo(-nk,nt);ctx.moveTo(nk,cy-R*.95);ctx.lineTo(nk,nt);ctx.stroke();ctx.beginPath();ctx.ellipse(0,nt,.085,.022,0,0,TAU);ctx.stroke();
  const ck='#b98a52';ctx.beginPath();ctx.moveTo(-.068,nt+.02);ctx.lineTo(-.08,nt-.08);ctx.lineTo(.08,nt-.08);ctx.lineTo(.068,nt+.02);ctx.closePath();ctx.fillStyle=shade(ctx,-.08,0,.08,0,ck,.3);ctx.fill();out(ctx,ck,.009); /* the cork */
  caduceus(ctx,0,nt-.07,.3,P.m,P.wing);
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.024;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,cy,R*.78,Math.PI*1.08,Math.PI*1.38);ctx.stroke(); /* highlight, upper left */
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(R*.38,cy+R*.42,.018,0,TAU);ctx.fill()}
/* backpacks (research/objects/items/backpack.md): the bag's size. Front view, standing on its base. Each size up is a
   new pack, not a recoloured one (after Stardew Valley's red Large Pack and blue Deluxe Pack): the satchel (16, worn
   tan leather, one flap), the rucksack (24, red canvas, a front pocket and side pockets) and the expedition pack (32,
   blue canvas on a frame, a bedroll strapped on top, two front pockets). ids: backpack-satchel|rucksack|expedition. */
const PACKS={satchel:{c:'#9a6a3e',w:.62,h:.56,pk:0,roll:0,trim:'#6a4526'},rucksack:{c:'#b0453a',w:.66,h:.78,pk:1,roll:0,trim:'#6a4526'},expedition:{c:'#3f6a9a',w:.72,h:.95,pk:2,roll:1,trim:'#5a3a22'}};
function buckle(ctx,x,y,s){ctx.fillStyle='#c9a24a';ctx.strokeStyle='#7a5a20';ctx.lineWidth=s*.12;ctx.beginPath();ctx.rect(x-s/2,y-s/2,s,s*.8);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-s*.4);ctx.lineTo(x,y+s*.2);ctx.stroke()}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
D.backpack=(ctx,o)=>{const id=o.id||'',k=/expedition/.test(id)?'expedition':/rucksack/.test(id)?'rucksack':'satchel',P=PACKS[k],c=P.c,w=P.w,h=P.h,x0=-w/2,y0=-h,R=rngMulberry((o.seed||5)*7+1);
  if(k==='expedition'){ctx.strokeStyle='#5a5a5a';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(x0-.03,0);ctx.lineTo(x0-.03,y0-.12);ctx.moveTo(-x0+.03,0);ctx.lineTo(-x0+.03,y0-.12);ctx.stroke()} /* the frame */
  if(k!=='satchel'){for(const s of[-1,1]){rrect(ctx,s<0?x0-.09:-x0-.01,y0+h*.4,.1,h*.5,.04);ctx.fillStyle=shade(ctx,-w,0,w,0,darken(c,.12),.2);ctx.fill();out(ctx,c,.01)}} /* side pockets */
  rrect(ctx,x0,y0,w,h,k==='satchel'?.08:.14);ctx.fillStyle=shade(ctx,x0,y0,-x0,0,c,.25);ctx.fill();out(ctx,c,.014); /* the body */
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.006;for(let i=0;i<6;i++){const yy=y0+h*(.15+.13*i);ctx.beginPath();ctx.moveTo(x0+.03,yy+R()*.01);ctx.lineTo(-x0-.03,yy+R()*.01);ctx.stroke()} /* weave or grain */
  ctx.strokeStyle=darken(c,.3);ctx.setLineDash([.02,.015]);ctx.lineWidth=.006;rrect(ctx,x0+.03,y0+.03,w-.06,h-.06,.1);ctx.stroke();ctx.setLineDash([]); /* stitching */
  const fh=h*(k==='satchel'?.55:.38);ctx.beginPath();ctx.moveTo(x0-.005,y0+.08);ctx.quadraticCurveTo(x0,y0-.01,x0+.12,y0-.01);ctx.lineTo(-x0-.12,y0-.01);ctx.quadraticCurveTo(-x0,y0-.01,-x0+.005,y0+.08);ctx.lineTo(-x0-.03,y0+fh);ctx.quadraticCurveTo(0,y0+fh+.06,x0+.03,y0+fh);ctx.closePath();
  ctx.fillStyle=shade(ctx,x0,y0,-x0,y0+fh,darken(c,.1),.3);ctx.fill();out(ctx,c,.012); /* the flap */
  for(const s of(k==='satchel'?[0]:[-.17,.17])){ctx.fillStyle=P.trim;ctx.fillRect(s*w-.025,y0+fh*.55,.05,fh*.6);buckle(ctx,s*w,y0+fh+.02,.07)} /* straps and buckles */
  if(P.pk){const n=P.pk;for(let i=0;i<n;i++){const pw=n>1?w*.38:w*.6,px=n>1?(i?.03:-pw-.03):-pw/2,py=y0+fh+.1,ph=h-fh-.16;rrect(ctx,px,py,pw,ph,.06);ctx.fillStyle=shade(ctx,px,py,px+pw,py+ph,lighten(c,.06),.25);ctx.fill();out(ctx,c,.01);
    ctx.beginPath();ctx.moveTo(px,py+ph*.32);ctx.quadraticCurveTo(px+pw/2,py+ph*.42,px+pw,py+ph*.32);ctx.stroke();buckle(ctx,px+pw/2,py+ph*.4,.05)}} /* front pockets */
  ctx.strokeStyle=P.trim;ctx.lineWidth=.03;ctx.beginPath();ctx.arc(0,y0,.07,Math.PI,0);ctx.stroke(); /* the carry loop */
  if(P.roll){const ry=y0-.09,rw=w*1.05;ctx.beginPath();ctx.ellipse(0,ry,rw/2,.08,0,0,TAU);ctx.fillStyle=shade(ctx,0,ry-.08,0,ry+.08,'#6a7a4a',.3);ctx.fill();out(ctx,'#6a7a4a',.01);
    ctx.beginPath();ctx.ellipse(rw/2-.02,ry,.025,.07,0,0,TAU);ctx.fillStyle='#4a5a32';ctx.fill();for(const s of[-.2,.2]){ctx.fillStyle=P.trim;ctx.fillRect(s*w-.015,ry-.085,.03,.17)}} /* the bedroll */
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.018;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0+.06,y0+h*.3);ctx.quadraticCurveTo(x0+.04,y0+h*.6,x0+.07,y0+h*.85);ctx.stroke()};
/* food (research/objects/items/food/): the potato, raw (skin red, purple or brown, from the id "potato-red", o.skin or
   the seed) and baked (split open, steaming, with butter); must be cooked to be eaten. "produce-<plant id>" draws what any
   other plant gives at harvest, by the part harvested (PLANTS.harvest): fruit, root, flower or leaf, in the plant's colours. */
D.potato=(ctx,o)=>{const id=o.id||'',baked=/baked/.test(id),sk=(id.match(/potato-(red|purple|brown)/)||[])[1]||o.skin||['red','purple','brown'][(o.seed||0)%3];
  if(!baked&&window.PLANTS&&PLANTS.tuber){PLANTS.tuber(ctx,0,-.3,.42,.29,-.15,sk,(o.seed||3)+1,{unit:true});return}
  if(!baked){ctx.beginPath();ctx.ellipse(0,-.3,.42,.29,-.15,0,TAU);ctx.fillStyle='#a77b4f';ctx.fill();out(ctx,'#a77b4f',.02);return}
  /* baked: a brown jacket split along the top, fluffy white inside, a pat of butter, steam */
  const sk2=darken('#8a5a32',.05);ctx.beginPath();ctx.ellipse(0,-.28,.45,.27,0,0,TAU);ctx.fillStyle=shade(ctx,-.45,-.5,.45,0,sk2,.35);ctx.fill();out(ctx,sk2,.018);
  ctx.beginPath();ctx.ellipse(0,-.4,.3,.11,0,0,TAU);ctx.fillStyle='#f6efd8';ctx.fill();ctx.strokeStyle='#5a3a1e';ctx.lineWidth=.02;ctx.stroke();
  ctx.fillStyle='rgba(230,215,170,.8)';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(-.2+i*.065,-.41+((i*37)%5-2)*.012,.03,0,TAU);ctx.fill()}
  ctx.fillStyle='#f4d35e';ctx.beginPath();ctx.moveTo(-.07,-.47);ctx.lineTo(.07,-.49);ctx.lineTo(.09,-.42);ctx.lineTo(-.05,-.4);ctx.closePath();ctx.fill();out(ctx,'#f4d35e',.01);
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.025;ctx.lineCap='round';for(const dx of[-.12,.02,.15]){ctx.beginPath();ctx.moveTo(dx,-.55);ctx.bezierCurveTo(dx-.06,-.65,dx+.06,-.72,dx,-.82);ctx.stroke()}};
D.produce=(ctx,o)=>{const pid=(o.id||'').replace(/^produce-/,''),P=window.PLANTS&&PLANTS.byId[pid],H=P&&PLANTS.harvest(P)||{part:'fruit'},acc=(P&&P.accent_color)||'#c8281e',fol=(P&&P.foliage_color)||'#4f8a40',part=H.part;
  const long=/^(corn|bean|pea|cucumber|squash|eggplant|asparagus|rhubarb)/.test(pid),bulb=/^(onion|garlic|beet|radish)/.test(pid);
  if(part==='leaf'){for(const[a,s]of[[-.5,.9],[.45,.85],[0,1]]){ctx.save();ctx.translate(0,-.05);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-.22*s,-.4*s,0,-.8*s);ctx.quadraticCurveTo(.22*s,-.4*s,0,0);ctx.fillStyle=shade(ctx,-.2,0,.2,0,fol,.3);ctx.fill();out(ctx,fol,.012);ctx.strokeStyle=lighten(fol,.3);ctx.lineWidth=.01;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-.76*s);ctx.stroke();ctx.restore()}ctx.fillStyle='#c9a55a';ctx.fillRect(-.06,-.12,.12,.05);return}
  if(part==='flower'){ctx.strokeStyle='#5c9a40';ctx.lineWidth=.03;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(.05,-.3,0,-.55);ctx.stroke();for(let i=0;i<10;i++){const a=i/10*TAU;ctx.save();ctx.translate(0,-.62);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,-.13,.06,.13,0,0,TAU);ctx.fillStyle=acc;ctx.fill();out(ctx,acc,.008);ctx.restore()}ctx.beginPath();ctx.arc(0,-.62,.08,0,TAU);ctx.fillStyle=/sunflower/.test(pid)?'#4a2a12':'#e8b81e';ctx.fill();return}
  if(part==='root'){const c=bulb?acc:acc;ctx.strokeStyle=fol;ctx.lineWidth=.03;ctx.lineCap='round';for(const a of[-.35,0,.35]){ctx.beginPath();ctx.moveTo(0,bulb?-.5:-.62);ctx.quadraticCurveTo(a*.4,-.8,a,-.98);ctx.stroke()}
    ctx.beginPath();if(bulb){ctx.ellipse(0,-.3,.26,.24,0,0,TAU)}else{ctx.moveTo(-.12,-.62);ctx.quadraticCurveTo(-.1,-.25,0,-.02);ctx.quadraticCurveTo(.1,-.25,.12,-.62);ctx.closePath()}
    ctx.fillStyle=shade(ctx,-.25,0,.25,0,c,.3);ctx.fill();out(ctx,c,.012);ctx.strokeStyle=darken(c,.3);ctx.lineWidth=.008;for(let i=1;i<5;i++){const y=bulb?-.45+i*.06:-.58+i*.1;ctx.beginPath();ctx.moveTo(-.05,y);ctx.lineTo(.04,y+.01);ctx.stroke()}return}
  /* fruit */ctx.beginPath();if(long)ctx.ellipse(0,-.3,.13,.36,.5,0,TAU);else ctx.arc(0,-.3,.28,0,TAU);ctx.fillStyle=shade(ctx,-.3,-.6,.3,0,acc,.35);ctx.fill();out(ctx,acc,.014);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-.1,-.42,.06,.03,-.5,0,TAU);ctx.fill();ctx.fillStyle='#3e7a2e';ctx.beginPath();ctx.ellipse(long?.15:0,long?-.6:-.58,.08,.03,0,0,TAU);ctx.fill();ctx.strokeStyle='#5c7a30';ctx.lineWidth=.02;ctx.beginPath();ctx.moveTo(long?.15:0,long?-.6:-.58);ctx.lineTo(long?.18:.02,long?-.68:-.68);ctx.stroke()};
/* a sack of garden soil (for earthing up potatoes): burlap, rolled open at the top, dark loam inside, a spill at the foot */
D.soil=(ctx)=>{const b='#b89a66';ctx.beginPath();ctx.moveTo(-.3,-.02);ctx.quadraticCurveTo(-.4,-.35,-.28,-.62);ctx.lineTo(.28,-.62);ctx.quadraticCurveTo(.4,-.35,.3,-.02);ctx.quadraticCurveTo(0,.03,-.3,-.02);ctx.closePath();
  ctx.fillStyle=shade(ctx,-.35,-.6,.35,0,b,.3);ctx.fill();out(ctx,b,.014);ctx.save();ctx.clip();ctx.strokeStyle='rgba(90,70,40,.25)';ctx.lineWidth=.006;for(let i=-.4;i<.4;i+=.03){ctx.beginPath();ctx.moveTo(i,-.7);ctx.lineTo(i+.05,0);ctx.stroke()}for(let y=-.6;y<0;y+=.03){ctx.beginPath();ctx.moveTo(-.4,y);ctx.lineTo(.4,y+.01);ctx.stroke()}ctx.restore(); /* the weave */
  ctx.beginPath();ctx.ellipse(0,-.62,.29,.07,0,0,TAU);ctx.fillStyle='#3e2c1c';ctx.fill();ctx.fillStyle='#5a4028';for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(-.2+i*.05,-.63+((i*7)%3-1)*.012,.022,0,TAU);ctx.fill()}
  ctx.beginPath();ctx.ellipse(0,-.62,.31,.075,0,0,TAU);ctx.strokeStyle=darken(b,.25);ctx.lineWidth=.03;ctx.stroke(); /* the rolled lip */
  ctx.fillStyle='#4e3824';ctx.beginPath();ctx.ellipse(.34,-.02,.14,.04,0,0,TAU);ctx.fill();ctx.font='bold .12px Georgia';ctx.fillStyle='rgba(70,50,25,.6)';ctx.textAlign='center';ctx.fillText('SOIL',0,-.28)};
/* weapons (research/objects/items/weapons.md): knife, sword and staff, each in bronze, iron or starmetal
   ("weapon-sword-iron"); o.state 'perfect' | 'damaged' (nicked edge, scratches, dulled) | 'broken' (snapped blade, split staff).
   Drawn on a diagonal, point up and to the right, like the other blades. */
const WMET={bronze:'#b98a45',iron:'#9aa0a8',starmetal:'#a9c2ea'};
D.weapon=(ctx,o)=>{const m=(o.id||'').match(/weapon-(knife|sword|staff)-(bronze|iron|starmetal)/)||[0,'sword','bronze'],kind=m[1],met=m[2],c=WMET[met],st=o.state||'perfect',dmg=st!=='perfect',brk=st==='broken';
  ctx.save();ctx.translate(-.05,-.08);ctx.rotate(-.8);
  if(kind==='staff'){ctx.scale(.82,.82);ctx.translate(0,.12);const L=1.15,w='#8a5a32';const seg=(a,b)=>{ctx.beginPath();ctx.roundRect(-.035,-b,.07,b-a,.03);paint(ctx,w)};const paint=(cx,col)=>{const g=cx.createLinearGradient(-.04,0,.04,0);g.addColorStop(0,lighten(col,.25));g.addColorStop(1,darken(col,.3));cx.fillStyle=g;cx.fill();cx.strokeStyle=darken(col,.5);cx.lineWidth=.01;cx.stroke()};
    const draw=(a,b)=>{ctx.beginPath();ctx.roundRect(-.035,-b,.07,b-a,.02);paint(ctx,w);ctx.strokeStyle=darken(w,.3);ctx.lineWidth=.005;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-.015+k*.01,-a-.02);ctx.lineTo(-.012+k*.01,-b+.02);ctx.stroke()}};
    if(brk){draw(0,.55);ctx.save();ctx.translate(.12,-.1);ctx.rotate(.35);draw(.58,L);ctx.restore()}else draw(0,L);
    for(const y of brk?[0]:[0,L-.1]){ctx.beginPath();ctx.roundRect(-.045,-y-.1,.09,.1,.02);paint(ctx,c)} /* the metal shoe and cap */
    if(!brk){ctx.beginPath();ctx.arc(0,-L-.04,.06,0,TAU);paint(ctx,met==='starmetal'?'#7ab0ff':c);if(met==='starmetal'){const g=ctx.createRadialGradient(0,-L-.04,.04,0,-L-.04,.14);g.addColorStop(0,'rgba(140,190,255,.55)');g.addColorStop(1,'rgba(140,190,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-L-.04,.14,0,TAU);ctx.fill()}}
    if(dmg&&!brk){ctx.strokeStyle='#3a2414';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(-.01,-.45);ctx.lineTo(.008,-.52);ctx.lineTo(-.006,-.6);ctx.lineTo(.01,-.66);ctx.stroke()}
    if(brk){ctx.fillStyle='#d8b888';for(const[x,y]of[[0,-.55],[.12-.05,-.1-.58]]){ctx.beginPath();ctx.moveTo(x-.035,y);ctx.lineTo(x-.015,y-.03);ctx.lineTo(x,y+.005);ctx.lineTo(x+.02,y-.035);ctx.lineTo(x+.035,y);ctx.fill()}}
    ctx.restore();return}
  const knife=kind==='knife',BL=knife?.42:.8,BW=knife?.075:.085,grip=knife?.16:.2;
  /* grip, guard, pommel */ctx.beginPath();ctx.roundRect(-.025,0,.05,grip,.02);ctx.fillStyle='#5a3a24';ctx.fill();ctx.strokeStyle='#2e1c10';ctx.lineWidth=.008;ctx.stroke();ctx.strokeStyle='#8a6a44';ctx.lineWidth=.006;for(let k=1;k<5;k++){ctx.beginPath();ctx.moveTo(-.025,k*grip/5);ctx.lineTo(.025,k*grip/5-.015);ctx.stroke()}
  ctx.beginPath();ctx.arc(0,grip+.025,.035,0,TAU);ctx.fillStyle=shade(ctx,-.03,grip,.03,grip+.06,c,.3);ctx.fill();out(ctx,c,.008);
  ctx.beginPath();ctx.roundRect(knife?-.05:-.13,-.03,knife?.1:.26,.035,.015);ctx.fillStyle=shade(ctx,-.13,-.03,.13,0,c,.3);ctx.fill();out(ctx,c,.008);
  /* the blade */const L=brk?BL*.45:BL;ctx.beginPath();ctx.moveTo(-BW/2,-.03);
  if(dmg){for(let k=1;k<=6;k++){const y=-.03-L*k/6;ctx.lineTo(-BW/2*(1-(knife?k/8:0))+(k%2?.012:0),y)}}else ctx.lineTo(-BW/2*(knife?.6:1),-.03-L*.85);
  if(brk){ctx.lineTo(-BW*.2,-.03-L-.02);ctx.lineTo(0,-.03-L+.02);ctx.lineTo(BW*.25,-.03-L-.03);ctx.lineTo(BW/2,-.03-L)}else{ctx.lineTo(0,-.03-L-(knife?.05:.08));ctx.lineTo(BW/2*(knife?.9:1),-.03-L*.85)}
  ctx.lineTo(BW/2,-.03);ctx.closePath();ctx.fillStyle=shade(ctx,-BW/2,0,BW/2,0,dmg?darken(c,.12):c,.35);ctx.fill();out(ctx,c,.008);
  ctx.strokeStyle=lighten(c,.45);ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(0,-.05);ctx.lineTo(0,-.03-L*.9);ctx.stroke(); /* the fuller */
  if(met==='starmetal'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(150,190,255,.6)';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc((k%2?.012:-.014),-.1-k*L/6,.008,0,TAU);ctx.fill()}ctx.restore()}
  if(dmg){ctx.strokeStyle='rgba(40,30,20,.45)';ctx.lineWidth=.005;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-.02,-.1-k*L/5);ctx.lineTo(.02,-.13-k*L/5);ctx.stroke()}}
  if(brk){ctx.save();ctx.translate(.17,-.05);ctx.rotate(1.2);ctx.beginPath();ctx.moveTo(-BW/2,0);ctx.lineTo(-BW/2,-L*.7);ctx.lineTo(0,-L*.7-.07);ctx.lineTo(BW/2,-L*.7);ctx.lineTo(BW/2,0);ctx.lineTo(0,.02);ctx.closePath();ctx.fillStyle=darken(c,.1);ctx.fill();out(ctx,c,.008);ctx.restore()} /* the snapped-off tip */
  ctx.restore()};
/* fuel: a bundle of firewood (split logs, tied) and a pile of kindling (twigs and chopped vine) */
D.firewood=(ctx)=>{const w='#8a5a32';for(const[x,y,r]of[[-.17,-.13,.13],[.0,-.13,.13],[.17,-.13,.13],[-.08,-.34,.13],[.09,-.34,.13]]){ctx.beginPath();ctx.moveTo(x-r*.9,y+r*.5);ctx.lineTo(x,y-r);ctx.lineTo(x+r*.9,y+r*.5);ctx.closePath();ctx.fillStyle=shade(ctx,x-r,y-r,x+r,y+r,'#c89a62',.25);ctx.fill();out(ctx,'#a87a42',.01);
  ctx.strokeStyle='rgba(120,80,40,.6)';ctx.lineWidth=.006;for(let k=1;k<3;k++){ctx.beginPath();ctx.arc(x,y+r*.15,r*.22*k,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}ctx.fillStyle=w;ctx.beginPath();ctx.moveTo(x-r*.9,y+r*.5);ctx.lineTo(x-r*.75,y+r*.62);ctx.lineTo(x+r*.75,y+r*.62);ctx.lineTo(x+r*.9,y+r*.5);ctx.fill()}
  ctx.strokeStyle='#c9a24a';ctx.lineWidth=.02;ctx.beginPath();ctx.moveTo(-.28,-.24);ctx.quadraticCurveTo(0,-.2,.28,-.24);ctx.stroke()};
D.kindling=(ctx)=>{const R=rngMulberry(5);for(let i=0;i<14;i++){const a=(R()-.5)*1.4,x=(R()-.5)*.5,y=-.05-R()*.2,l=.18+R()*.2;ctx.strokeStyle=i%3?'#7a5a34':'#4f6a2e';ctx.lineWidth=.02+R()*.015;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-Math.cos(a)*l/2,y-Math.sin(a)*l/2);ctx.lineTo(x+Math.cos(a)*l/2,y+Math.sin(a)*l/2);ctx.stroke()}};
/* the cauldron as an item to carry (KITCHEN.cauldron draws it hung over a fire) */
D.cauldron=(ctx)=>{ctx.beginPath();ctx.moveTo(-.3,-.5);ctx.bezierCurveTo(-.38,-.1,-.2,-.02,0,-.02);ctx.bezierCurveTo(.2,-.02,.38,-.1,.3,-.5);ctx.closePath();ctx.fillStyle=shade(ctx,-.35,-.5,.35,0,'#3a3a3e',.35);ctx.fill();out(ctx,'#3a3a3e',.014);
  ctx.beginPath();ctx.ellipse(0,-.5,.32,.06,0,0,TAU);ctx.fillStyle='#2a2a2e';ctx.fill();ctx.strokeStyle='#5a5a60';ctx.lineWidth=.03;ctx.stroke();for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*.12,-.04);ctx.lineTo(s*.16,0);ctx.lineWidth=.04;ctx.strokeStyle='#2a2a2e';ctx.stroke()}
  ctx.strokeStyle='#5a5a60';ctx.lineWidth=.015;ctx.beginPath();ctx.arc(0,-.5,.3,Math.PI*1.05,Math.PI*1.95);ctx.stroke()};
/* cooked food: "cooked-<plant id>" a dish of the roasted produce; recipes by id; "burnt" a charred lump */
const DISH={'potato-soup':['#e8d6a0','#c9a24a'],'ratatouille':['#b8402a','#5a8a2a'],'bean-stew':['#8a4a2a','#d8b878'],'squash-roast':['#e08a2a','#f4e0a0'],'rhubarb-crumble':['#c8506a','#e8c88a'],burnt:['#2a2420','#4a3a30']};
D.dish=(ctx,o)=>{const id=(o.id||'').replace(/^dish-/,''),cookd=/^cooked-/.test(id),P=cookd&&window.PLANTS&&PLANTS.byId[id.slice(7)],col=DISH[id]||[P&&P.accent_color?darken(P.accent_color,.15):'#b8783a','#f4e0a0'],bowl=!cookd&&id!=='rhubarb-crumble'&&id!=='burnt';
  if(bowl){ctx.beginPath();ctx.moveTo(-.38,-.32);ctx.quadraticCurveTo(-.34,-.02,0,-.02);ctx.quadraticCurveTo(.34,-.02,.38,-.32);ctx.closePath();ctx.fillStyle=shade(ctx,-.38,-.3,.38,0,'#d8c8a8',.3);ctx.fill();out(ctx,'#b8a888',.012);
    ctx.beginPath();ctx.ellipse(0,-.32,.38,.08,0,0,TAU);ctx.fillStyle=col[0];ctx.fill();ctx.strokeStyle='#b8a888';ctx.lineWidth=.014;ctx.stroke();ctx.fillStyle=col[1];const R=rngMulberry(id.length*7);for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse((R()-.5)*.5,-.32+(R()-.5)*.08,.03+R()*.02,.015,R()*3,0,TAU);ctx.fill()}}
  else{ctx.beginPath();ctx.ellipse(0,-.06,.42,.07,0,0,TAU);ctx.fillStyle='#ece4d4';ctx.fill();out(ctx,'#c8c0b0',.01);ctx.beginPath();ctx.ellipse(0,-.08,.32,.045,0,0,TAU);ctx.strokeStyle='#d8d0c0';ctx.lineWidth=.008;ctx.stroke();
    const R=rngMulberry(id.length*11);for(let i=0;i<(id==='burnt'?1:4);i++){ctx.beginPath();ctx.ellipse((i-1.5)*.13+(R()-.5)*.03,-.15-(i%2)*.03,id==='burnt'?.2:.09,id==='burnt'?.1:.07,R(),0,TAU);ctx.fillStyle=shade(ctx,-.2,-.25,.2,-.05,col[0],.3);ctx.fill();out(ctx,col[0],.008);
      if(id!=='burnt'){ctx.strokeStyle='rgba(60,30,10,.5)';ctx.lineWidth=.01;ctx.beginPath();ctx.moveTo((i-1.5)*.13-.04,-.17);ctx.lineTo((i-1.5)*.13+.03,-.14);ctx.stroke()}}} /* char marks */
  if(id!=='burnt'){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.02;ctx.lineCap='round';for(const dx of[-.1,.08]){ctx.beginPath();ctx.moveTo(dx,bowl?-.42:-.25);ctx.bezierCurveTo(dx-.05,-.52,dx+.05,-.58,dx,-.68);ctx.stroke()}}else{ctx.fillStyle='rgba(80,80,80,.5)';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(-.05+k*.06,-.35-k*.08,.05,0,TAU);ctx.fill()}}};
D.parcel=(ctx)=>{const c='#b08a5a';ctx.fillStyle=shade(ctx,-.3,-.5,.3,0,c,.2);ctx.fillRect(-.3,-.45,.6,.45);ctx.strokeStyle='#7a2a2a';ctx.lineWidth=.03;ctx.beginPath();ctx.moveTo(0,-.45);ctx.lineTo(0,0);ctx.moveTo(-.3,-.22);ctx.lineTo(.3,-.22);ctx.stroke()};
D.coin=(ctx,o)=>{ctx.save();ctx.translate(0,-.45);coin(ctx,0,0,.42,o);ctx.restore()};
D.coins=(ctx,o)=>{coins(ctx,0,0,.8,o.n||5,o)};
D.chest=(ctx,o)=>{if(window.CONTAINERS)CONTAINERS.drawChest(ctx,{},0,0,1.1,o.state==='open'?'open':'closed',o.seed||1,{fill:o.fill==null?.6:o.fill});else D.parcel(ctx,o)};
D.ax=(ctx,o)=>{if(window.TOOLS){const t=/star/.test(o.id||'')?2:/iron/.test(o.id||'')?1:0;TOOLS.drawAx(ctx,t,-.25,0,1,.55)}};
const ALIAS={'scroll':'scroll','weapon':'weapon','firewood':'firewood','kindling':'kindling','cauldron':'cauldron','cooked':'dish','dish':'dish','burnt':'dish','potato-soup':'dish','ratatouille':'dish','bean-stew':'dish','squash-roast':'dish','rhubarb-crumble':'dish','soil':'soil','potato':'potato','produce':'produce','potion':'potion','health':'health','backpack':'backpack','boots':'boots','shirt':'shirt','pants':'pants','necklace':'necklace','sword':'sword','cape':'cape','gloves':'gloves','crown':'crown','chalice':'chalice','astrolabe':'astrolabe','compass':'compass','straightedge':'straightedge','lyre':'lyre','tile':'tile','amphora':'amphora','lamp':'lamp','ring':'ring','map':'map','bust':'bust','hourglass':'hourglass','coin':'coin','coins':'coins','chest':'chest','bronze-ax':'ax','iron-ax':'ax','starmetal-ax':'ax'};
function keyOf(key){key=String(key||'');if(D[key])return key;if(ALIAS[key])return ALIAS[key];const pre=key.split('-')[0];if(D[pre])return pre;if(ALIAS[pre])return ALIAS[pre];return null}
function has(key){return !!keyOf(key)}
function draw(ctx,key,x,y,size,o){o=Object.assign({},o||{},{id:key});const k=keyOf(key)||'parcel';
  /* the chest and the ax pick their detail from their size in px, so they are drawn at full scale */
  if(k==='chest'&&window.CONTAINERS){CONTAINERS.drawChest(ctx,{},x,y,size*1.1,o.state==='open'?'open':'closed',o.seed||1,{fill:o.fill==null?.6:o.fill});return}
  if(k==='ax'&&window.TOOLS){const t=/star/.test(key)?2:/iron/.test(key)?1:0;TOOLS.drawAx(ctx,t,x-size*.25,y,size,.55);return}
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.lineJoin='round';
  if(k!=='coins'&&k!=='chest')shadow(ctx,.8);D[k](ctx,o);ctx.restore()}

window.ITEMART={draw,coin,coins,has,D,METAL};
})();
