/* Items: things the player can pick up and keep in the inventory. Needs core.js (and tools.js for the axes,
   containers.js for the chest). Research: research/objects/items/ (Items category: coins, treasure, clothing, scrolls, potions).

   ITEMART.draw(ctx, key, x, y, size, o)   one item resting on (x, y) (the middle of its base), size = its height in px
     key   an item id from the game (e.g. 'chalice', 'necklace-lapis', 'scroll-angles') or a kind ('coin', 'scroll'…);
           ids are matched by their longest known prefix, so 'cape-indigo' draws a cape in indigo
     o     seed; state (coins: 'fresh' | 'worn' | 'rusty' | 'muddy'); metal (coins: 'gold' | 'silver' | 'bronze')
   ITEMART.coin(ctx, x, y, r, o)          one coin, centred on (x, y), radius r: beaded rim, a legend round the edge, a crest
   ITEMART.coins(ctx, x, y, size, n, o)   a small heap of n coins (for chests and drops)
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
D.parcel=(ctx)=>{const c='#b08a5a';ctx.fillStyle=shade(ctx,-.3,-.5,.3,0,c,.2);ctx.fillRect(-.3,-.45,.6,.45);ctx.strokeStyle='#7a2a2a';ctx.lineWidth=.03;ctx.beginPath();ctx.moveTo(0,-.45);ctx.lineTo(0,0);ctx.moveTo(-.3,-.22);ctx.lineTo(.3,-.22);ctx.stroke()};
D.coin=(ctx,o)=>{ctx.save();ctx.translate(0,-.45);coin(ctx,0,0,.42,o);ctx.restore()};
D.coins=(ctx,o)=>{coins(ctx,0,0,.8,o.n||5,o)};
D.chest=(ctx,o)=>{if(window.CONTAINERS)CONTAINERS.drawChest(ctx,{},0,0,1.1,o.state==='open'?'open':'closed',o.seed||1,{fill:o.fill==null?.6:o.fill});else D.parcel(ctx,o)};
D.ax=(ctx,o)=>{if(window.TOOLS){const t=/star/.test(o.id||'')?2:/iron/.test(o.id||'')?1:0;TOOLS.drawAx(ctx,t,-.25,0,1,.55)}};
const ALIAS={'necklace':'necklace','sword':'sword','cape':'cape','gloves':'gloves','crown':'crown','chalice':'chalice','astrolabe':'astrolabe','compass':'compass','straightedge':'straightedge','lyre':'lyre','tile':'tile','amphora':'amphora','lamp':'lamp','ring':'ring','map':'map','bust':'bust','hourglass':'hourglass','coin':'coin','coins':'coins','chest':'chest','bronze-ax':'ax','iron-ax':'ax','starmetal-ax':'ax'};
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
