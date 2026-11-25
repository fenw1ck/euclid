/* Kitchen and cooking fire: a wood-fired kitchen range (stove with an oven), a kitchen table, a kitchen island, a
   campfire and a cauldron hung over it. Needs core.js. Research: research/objects/furniture/kitchen.md and
   research/objects/cooking-fire.md. Front view (seen from the room), light from the upper left; sizes in metres
   (1 unit = 1 m) like furniture.js, so `size` is px per metre.
   KITCHEN.stove(ctx,x,y,size,seed,o)     a cast-iron range: firebox and oven doors, hob with pots, a stove pipe; o.lit, o.t (flicker), o.open (oven door open)
   KITCHEN.table(ctx,x,y,size,seed,o)     a scrubbed farmhouse table with turned legs and a bench
   KITCHEN.island(ctx,x,y,size,seed,o)    a block-topped island on cupboards, with hanging pans above it if o.rack
   KITCHEN.campfire(ctx,x,y,size,t,o)     a ring of stones, crossed logs and flames (o.lit false: ash and embers)
   KITCHEN.cauldron(ctx,x,y,size,t,o)     an iron cauldron on a tripod; o.fill colour of what is cooking, o.bubbling
   KITCHEN.shelf(ctx,x,y,size,seed)       a wall shelf of crocks, jars and a bundle of herbs */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('kitchen.js needs core.js loaded first');
const {mix,lighten,darken,rngMulberry}=A,TAU=Math.PI*2;
const WOOD=['#8a5a32','#a6713f','#6e4526','#b88a58'],TILE=['#3a5a7a','#2f6a4a','#7a3a2a'];
function box(ctx,x,y,w,h,c,k){const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,lighten(c,k||.2));g.addColorStop(1,darken(c,(k||.2)*1.3));ctx.fillStyle=g;ctx.fillRect(x,y,w,h);ctx.strokeStyle=darken(c,.45);ctx.lineWidth=Math.max(.6,Math.min(w,h)*.02);ctx.strokeRect(x,y,w,h)}
function flame(ctx,x,y,w,h,t,i){const f=1+.12*Math.sin(t*9+i*2)+.06*Math.sin(t*23+i);ctx.save();ctx.globalCompositeOperation='lighter';
  for(const[k,c]of[[1,'rgba(255,120,30,.75)'],[.65,'rgba(255,190,60,.85)'],[.35,'rgba(255,245,180,.9)']]){ctx.beginPath();ctx.moveTo(x-w*k/2,y);ctx.bezierCurveTo(x-w*k/2,y-h*k*.5*f,x-w*k*.1,y-h*k*.7*f,x+Math.sin(t*5+i)*w*.15,y-h*k*f);ctx.bezierCurveTo(x+w*k*.1,y-h*k*.7*f,x+w*k/2,y-h*k*.5*f,x+w*k/2,y);ctx.closePath();ctx.fillStyle=c;ctx.fill()}ctx.restore()}
function glow(ctx,x,y,r,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,170,70,${a})`);g.addColorStop(1,'rgba(255,170,70,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
function pot(ctx,x,y,s,c,lid){ctx.beginPath();ctx.moveTo(x-s*.5,y-s*.6);ctx.lineTo(x-s*.45,y);ctx.lineTo(x+s*.45,y);ctx.lineTo(x+s*.5,y-s*.6);ctx.closePath();const g=ctx.createLinearGradient(x-s/2,0,x+s/2,0);g.addColorStop(0,lighten(c,.3));g.addColorStop(1,darken(c,.35));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=darken(c,.5);ctx.lineWidth=Math.max(.6,s*.04);ctx.stroke();
  if(lid){ctx.beginPath();ctx.ellipse(x,y-s*.6,s*.52,s*.08,0,0,TAU);ctx.fillStyle=darken(c,.1);ctx.fill();ctx.stroke();ctx.fillRect(x-s*.06,y-s*.74,s*.12,s*.08)}}

/* a cast-iron range: black body on legs, brass rail, firebox door (left) with a glow, oven door (right) with a
   thermometer, a hob of round plates with a kettle and a pot, a stove pipe up the wall, a tiled splashback */
function stove(ctx,x,y,size,seed,o){o=o||{};const R=rngMulberry(seed*13+1),s=size,t=o.t||0,iron='#2e2c2c',W=1.1*s,H=.85*s,x0=x-W/2,y0=y-H,tile=TILE[Math.floor(R()*TILE.length)];
  for(let i=0;i<5;i++)for(let j=0;j<6;j++){const tw=W*1.1/5,th=s*.14;box(ctx,x-W*.55+i*tw,y0-s*.85+j*th,tw,th,(i+j)%2?tile:lighten(tile,.6),.1)} /* splashback */
  box(ctx,x-.07*s,y0-s*1.4,.14*s,s*1.4-H*.1,iron,.3); /* the pipe */
  for(const lx of[x0+W*.06,x0+W*.9])box(ctx,lx,y-s*.1,W*.04,s*.1,iron);
  box(ctx,x0,y0,W,H-s*.1,iron,.25);ctx.fillStyle='#c9a24a';ctx.fillRect(x0-W*.02,y0+H*.12,W*1.04,s*.025); /* body and the brass rail */
  box(ctx,x0-W*.02,y0-s*.04,W*1.04,s*.06,'#3a3836',.3);for(const[px,c,l]of[[.28,'#8a8a90',true],[.7,'#b06a3a',false]]){const hx=x0+W*px;ctx.fillStyle='#1a1818';ctx.beginPath();ctx.ellipse(hx,y0-s*.02,W*.13,s*.02,0,0,TAU);ctx.fill();pot(ctx,hx,y0-s*.03,s*.24,c,l)}
  if(o.lit!==false){ctx.save();ctx.globalAlpha=.6+.3*Math.sin(t*3);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=s*.015;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0+W*.28,y0-s*.24);ctx.bezierCurveTo(x0+W*.24,y0-s*.34,x0+W*.32,y0-s*.4,x0+W*.28,y0-s*.5);ctx.stroke();ctx.restore()} /* steam */
  const fd=[x0+W*.07,y0+H*.24,W*.3,H*.42],od=[x0+W*.43,y0+H*.24,W*.5,H*.58];
  box(ctx,...fd,'#3a3836',.3);ctx.fillStyle='#120e0c';ctx.fillRect(fd[0]+fd[2]*.15,fd[1]+fd[3]*.5,fd[2]*.7,fd[3]*.3);if(o.lit!==false){ctx.save();ctx.beginPath();ctx.rect(fd[0]+fd[2]*.15,fd[1]+fd[3]*.5,fd[2]*.7,fd[3]*.3);ctx.clip();for(let i=0;i<3;i++)flame(ctx,fd[0]+fd[2]*(.3+i*.2),fd[1]+fd[3]*.8,fd[2]*.25,fd[3]*.35,t,i);ctx.restore();glow(ctx,fd[0]+fd[2]/2,fd[1]+fd[3]*.65,s*.4,.35)}
  ctx.strokeStyle='#5a5856';ctx.lineWidth=s*.008;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(fd[0]+fd[2]*k/4,fd[1]+fd[3]*.5);ctx.lineTo(fd[0]+fd[2]*k/4,fd[1]+fd[3]*.8);ctx.stroke()} /* grate */
  if(o.open){ctx.fillStyle='#120e0c';ctx.fillRect(...od);ctx.fillStyle='rgba(255,150,60,.25)';ctx.fillRect(od[0],od[1]+od[3]*.5,od[2],od[3]*.5);box(ctx,od[0],od[1]+od[3],od[2],s*.04,'#3a3836')}
  else{box(ctx,...od,'#3a3836',.3);ctx.fillStyle='#c9a24a';ctx.fillRect(od[0]+od[2]*.1,od[1]+od[3]*.1,od[2]*.8,s*.02);ctx.beginPath();ctx.arc(od[0]+od[2]/2,od[1]+od[3]*.45,od[2]*.12,0,TAU);ctx.fillStyle='#efe4c8';ctx.fill();ctx.strokeStyle='#c9a24a';ctx.lineWidth=s*.01;ctx.stroke();
    ctx.strokeStyle='#a02020';ctx.beginPath();ctx.moveTo(od[0]+od[2]/2,od[1]+od[3]*.45);ctx.lineTo(od[0]+od[2]*(.5+.08*Math.cos(t)),od[1]+od[3]*.38);ctx.stroke()} /* the oven thermometer */
  ctx.fillStyle='#c9a24a';for(const hx of[fd[0]+fd[2]*.8,od[0]+od[2]*.9]){ctx.beginPath();ctx.arc(hx,fd[1]+fd[3]*.25,s*.018,0,TAU);ctx.fill()}}
/* a farmhouse table: a thick scrubbed top, turned legs, a bench in front, a loaf and a bowl on top */
function table(ctx,x,y,size,seed,o){const R=rngMulberry(seed*7+3),s=size,w=WOOD[Math.floor(R()*WOOD.length)],W=1.6*s,top=y-.76*s;
  for(const lx of[-.46,.42])box(ctx,x+lx*W,top+s*.06,W*.05,.7*s,darken(w,.1));
  box(ctx,x-W/2,top,W,s*.07,lighten(w,.25),.15);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x-W/2,top,W,s*.015);
  ctx.beginPath();ctx.ellipse(x-W*.18,top-s*.06,s*.13,s*.07,0,0,TAU);ctx.fillStyle='#c8904a';ctx.fill();ctx.strokeStyle='#8a5a2a';ctx.lineWidth=s*.008;ctx.stroke();for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x-W*.18-s*.07+k*s*.06,top-s*.11);ctx.lineTo(x-W*.18-s*.04+k*s*.06,top-s*.06);ctx.stroke()} /* a loaf */
  ctx.beginPath();ctx.moveTo(x+W*.15-s*.12,top-s*.1);ctx.quadraticCurveTo(x+W*.15,top+s*.01,x+W*.15+s*.12,top-s*.1);ctx.closePath();ctx.fillStyle='#d8c8a8';ctx.fill();ctx.stroke();
  for(const[lx,bk]of[[-.4,0],[.36,0]])box(ctx,x+lx*W,y-.42*s,W*.04,.42*s,darken(w,.2));box(ctx,x-W*.44,y-.46*s,W*.88,s*.06,w,.15)} /* the bench */
/* an island: cupboards with panel doors and knobs under a butcher-block top; o.rack: a rail of pans above */
function island(ctx,x,y,size,seed,o){o=o||{};const R=rngMulberry(seed*11+5),s=size,w=WOOD[Math.floor(R()*WOOD.length)],paint=['#6a8a7a','#8a6a5a','#e8e0cc','#4a5a7a'][Math.floor(R()*4)],W=1.5*s,top=y-.9*s;
  box(ctx,x-W/2,top+s*.06,W,.84*s,paint,.15);for(let i=0;i<3;i++){const dx=x-W/2+W*(.04+i*.32);box(ctx,dx,top+s*.14,W*.28,s*.6,lighten(paint,.08),.12);ctx.strokeStyle=darken(paint,.3);ctx.lineWidth=s*.006;ctx.strokeRect(dx+W*.03,top+s*.2,W*.22,s*.48);ctx.fillStyle='#c9a24a';ctx.beginPath();ctx.arc(dx+W*.24,top+s*.45,s*.015,0,TAU);ctx.fill()}
  box(ctx,x-W*.53,top,W*1.06,s*.08,'#b8844e',.15);ctx.strokeStyle='rgba(90,50,20,.35)';ctx.lineWidth=s*.004;for(let i=1;i<10;i++){ctx.beginPath();ctx.moveTo(x-W*.53+i*W*1.06/10,top);ctx.lineTo(x-W*.53+i*W*1.06/10,top+s*.08);ctx.stroke()}
  ctx.fillStyle='#e0d8c0';ctx.beginPath();ctx.ellipse(x+W*.2,top-s*.03,s*.14,s*.03,0,0,TAU);ctx.fill();ctx.fillStyle='#c83a2a';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(x+W*.15+k*s*.05,top-s*.05,s*.03,0,TAU);ctx.fill()} /* tomatoes on a board */
  if(o.rack){const ry=top-s*.95;ctx.strokeStyle='#5a5856';ctx.lineWidth=s*.015;ctx.beginPath();ctx.moveTo(x-W*.4,ry);ctx.lineTo(x+W*.4,ry);ctx.moveTo(x-W*.4,ry);ctx.lineTo(x-W*.4,ry-s*.6);ctx.moveTo(x+W*.4,ry);ctx.lineTo(x+W*.4,ry-s*.6);ctx.stroke();
    [['#b06a3a',.28],['#3a3836',.22],['#b06a3a',.2],['#8a8a90',.26]].forEach(([c,r],i)=>{const px=x-W*.3+i*W*.2;ctx.beginPath();ctx.moveTo(px,ry);ctx.lineTo(px,ry+s*.08);ctx.stroke();ctx.beginPath();ctx.arc(px,ry+s*.08+r*s*.5,r*s*.5,0,TAU);const g=ctx.createRadialGradient(px-r*s*.15,ry+s*.08+r*s*.35,0,px,ry+s*.08+r*s*.5,r*s*.5);g.addColorStop(0,lighten(c,.3));g.addColorStop(1,darken(c,.3));ctx.fillStyle=g;ctx.fill()})}}
/* a campfire: a ring of stones, logs crossed in a cone, flames and sparks; unlit: grey ash and a few embers */
function campfire(ctx,x,y,size,t,o){o=o||{};const s=size,lit=o.lit!==false,R=rngMulberry(17);if(lit)glow(ctx,x,y-s*.25,s*1.2,.3+.05*Math.sin(t*7));
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x,y,s*.55,s*.12,0,0,TAU);ctx.fill();ctx.fillStyle=lit?'#3a2a20':'#8a8580';ctx.beginPath();ctx.ellipse(x,y-s*.02,s*.36,s*.08,0,0,TAU);ctx.fill();
  for(const[a,b]of[[-.32,-.14],[.3,-.18],[-.1,-.26],[.12,-.24]]){ctx.save();ctx.translate(x,y-s*.06);ctx.rotate(a<0?-.6:.6);ctx.fillStyle='#6e4526';ctx.fillRect(-s*.035,b*s,s*.07,s*.36);ctx.fillStyle='#c89a62';ctx.beginPath();ctx.ellipse(0,b*s,s*.035,s*.02,0,0,TAU);ctx.fill();ctx.restore()}
  for(let i=0;i<11;i++){const a=i/11*TAU,sx=x+Math.cos(a)*s*.45,sy=y-s*.02+Math.sin(a)*s*.1,r=s*(.07+R()*.03);ctx.beginPath();ctx.ellipse(sx,sy,r,r*.7,0,0,TAU);const g=ctx.createLinearGradient(sx-r,sy-r,sx+r,sy+r);g.addColorStop(0,'#b8b2a8');g.addColorStop(1,'#5a5650');ctx.fillStyle=g;ctx.fill()}
  if(lit){for(let i=0;i<3;i++)flame(ctx,x+(i-1)*s*.1,y-s*.06,s*.28,s*(.5+.15*(i===1)),t,i);ctx.fillStyle='rgba(255,200,90,.9)';for(let k=0;k<5;k++){const u=(t*.8+k*.21)%1;ctx.beginPath();ctx.arc(x+Math.sin(k*3+t*2)*s*.15,y-s*(.4+u*.6),s*.012*(1-u),0,TAU);ctx.fill()}}
  else{ctx.fillStyle='rgba(255,110,40,.8)';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(x+(k-1.5)*s*.06,y-s*.05,s*.012,0,TAU);ctx.fill()}}}
/* a cauldron on a tripod of iron rods (stand it over the campfire) */
function cauldron(ctx,x,y,size,t,o){o=o||{};const s=size,cy=y-s*.62;ctx.strokeStyle='#3a3836';ctx.lineWidth=s*.03;ctx.lineCap='round';
  for(const dx of[-.5,.5,0]){ctx.beginPath();ctx.moveTo(x+dx*s,y-(dx?0:s*.02));ctx.lineTo(x,y-s*1.25);ctx.stroke()}ctx.beginPath();ctx.moveTo(x,y-s*1.25);ctx.lineTo(x,cy-s*.32);ctx.lineWidth=s*.012;ctx.stroke();
  ctx.beginPath();ctx.arc(x,cy-s*.18,s*.3,Math.PI*1.1,Math.PI*1.9);ctx.stroke(); /* the bail */
  ctx.beginPath();ctx.moveTo(x-s*.32,cy-s*.18);ctx.bezierCurveTo(x-s*.4,cy+s*.15,x-s*.2,cy+s*.25,x,cy+s*.25);ctx.bezierCurveTo(x+s*.2,cy+s*.25,x+s*.4,cy+s*.15,x+s*.32,cy-s*.18);ctx.closePath();
  const g=ctx.createLinearGradient(x-s*.35,0,x+s*.35,0);g.addColorStop(0,'#6a686a');g.addColorStop(.5,'#3a3a3e');g.addColorStop(1,'#1a1a1e');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#121214';ctx.lineWidth=s*.012;ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,cy-s*.18,s*.33,s*.07,0,0,TAU);ctx.fillStyle=o.fill||'#3a3020';ctx.fill();ctx.strokeStyle='#5a5a60';ctx.lineWidth=s*.025;ctx.stroke();
  if(o.bubbling){ctx.fillStyle=lighten(o.fill||'#8a6a3a',.35);for(let k=0;k<5;k++){const u=(t*1.3+k*.37)%1;ctx.globalAlpha=1-u;ctx.beginPath();ctx.arc(x+(k-2)*s*.1,cy-s*.19-u*s*.02,s*.025*(.5+u),0,TAU);ctx.fill()}ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=s*.02;for(const dx of[-.08,.1]){ctx.beginPath();ctx.moveTo(x+dx*s,cy-s*.28);ctx.bezierCurveTo(x+dx*s-s*.06,cy-s*.4,x+dx*s+s*.06,cy-s*.5,x+dx*s,cy-s*.62-.03*s*Math.sin(t*2));ctx.stroke()}}}
/* a wall shelf: crocks, jars of preserves, a hanging bunch of herbs */
function shelf(ctx,x,y,size,seed){const R=rngMulberry(seed*5+9),s=size,W=1.2*s;box(ctx,x-W/2,y,W,s*.05,'#8a5a32');for(const dx of[-.4,.4]){ctx.fillStyle='#5a3a24';ctx.beginPath();ctx.moveTo(x+dx*W,y+s*.05);ctx.lineTo(x+dx*W,y+s*.2);ctx.lineTo(x+dx*W-s*.08*Math.sign(dx),y+s*.05);ctx.fill()}
  let px=x-W*.42;for(let i=0;i<5;i++){const w=s*(.12+R()*.1),h=s*(.14+R()*.12),jar=R()<.5,c=jar?['#c83a2a','#6a3a8a','#e0a020','#4a8a3a'][Math.floor(R()*4)]:'#c8b89a';
    ctx.fillStyle=c;ctx.globalAlpha=jar?.85:1;ctx.beginPath();ctx.roundRect(px,y-h,w,h,w*.25);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=darken(c,.4);ctx.lineWidth=s*.006;ctx.stroke();ctx.fillStyle=jar?'#e8dcc0':'#8a7a5a';ctx.fillRect(px+w*.1,y-h-s*.02,w*.8,s*.03);px+=w+s*.04}
  ctx.strokeStyle='#5a7a3a';ctx.lineWidth=s*.012;for(let k=0;k<7;k++){ctx.beginPath();ctx.moveTo(x+W*.36,y+s*.05);ctx.lineTo(x+W*.36+(k-3)*s*.02,y+s*.3);ctx.stroke()}}
window.KITCHEN={stove,table,island,campfire,cauldron,shelf};
})();
